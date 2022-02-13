const { Harmony } = require('@harmony-js/core');
const {
    ChainID,
    ChainType,
    hexToNumber,
    numberToHex,
    fromWei,
    Units,
    Unit,
  } = require('@harmony-js/utils');

const fs = require("fs");
const readline = require("readline");

const ethers = require("ethers");

const config = require("./../config.json");
const abi = require("./abi.json");
const rewardLookup = require("./rewards.json");

const callOptions = { gasPrice: config.gasPrice, gasLimit: config.gasLimit };

let provider, questContract, wallet;

const hmy = new Harmony(
    getRpc(),
    {
        chainType: ChainType.Harmony,
        chainId: ChainID.HmyMainnet,
    },
);

hmy.wallet.addByPrivateKey(process.env.ETH_PRIVATE_KEY);

async function main() {
    try {
        provider = new ethers.providers.JsonRpcProvider(getRpc());
        questContract = new ethers.Contract(
            config.questContract,
            abi,
            provider
        );

        wallet = fs.existsSync(config.wallet.encryptedWalletPath)
            ? await getEncryptedWallet()
            : await createWallet();

        console.clear();
        checkForQuests();
    } catch (err) {
        console.clear();
        console.error(`Unable to run: ${err.message}`);
    }
}

async function getEncryptedWallet() {
    console.log("\nHi. You need to enter the password you chose previously.");
    let pw = 'a'//await promptForInput("Enter your password: ", "password");

    try {
        let encryptedWallet = fs.readFileSync(
            config.wallet.encryptedWalletPath,
            "utf8"
        );
        let decryptedWallet = ethers.Wallet.fromEncryptedJsonSync(
            encryptedWallet,
            pw
        );
        return decryptedWallet.connect(provider);
    } catch (err) {
        throw new Error(
            'Unable to read your encrypted wallet. Try again, making sure you provide the correct password. If you have forgotten your password, delete the file "w.json" and run the application again.'
        );
    }
}

async function createWallet() {
    console.log("\nHi. You have not yet encrypted your private key.");
    let pw = await promptForInput(
        "Choose a password for encrypting your private key, and enter it here: ",
        "password"
    );
    let pk = await promptForInput(
        "Now enter your private key: ",
        "private key"
    );

    try {
        let newWallet = new ethers.Wallet(pk, provider);
        let enc = await newWallet.encrypt(pw);
        fs.writeFileSync(config.wallet.encryptedWalletPath, enc);
        return newWallet;
    } catch (err) {
        throw new Error(
            "Unable to create your wallet. Try again, making sure you provide a valid private key."
        );
    }
}

async function promptForInput(prompt, promptFor) {
    const read = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    try {
        let input = await new Promise((resolve) => {
            read.question(prompt, (answer) => resolve(answer));
        });
        if (!input)
            throw new Error(
                `No ${promptFor} provided. Try running the application again, and provide a ${promptFor}.`
            );
        return input;
    } finally {
        read.close();
    }
}

async function checkForQuests() {
    try {
        console.log("\nChecking for quests...\n");
        let activeQuests = await questContract.getActiveQuests(
            config.wallet.address
        );

        // Display the finish time for any quests in progress
        let runningQuests = activeQuests.filter(
            (quest) => quest.completeAtTime >= Math.round(Date.now() / 1000)
        );
        runningQuests.forEach((quest) =>
            console.log(
                `Quest led by hero ${
                    quest.heroes[0]
                } is due to complete at ${displayTime(quest.completeAtTime)}`
            )
        );

        // Complete any quests that need to be completed
        let doneQuests = activeQuests.filter(
            (quest) => !runningQuests.includes(quest)
        );
        for (const quest of doneQuests) {
            await completeQuest(quest.heroes[0]);
        }

        // Start fishing / foraging quests needing to start
        let questsToStart = await getQuestsToStart(activeQuests);
        for (const quest of questsToStart) {
            await startQuest(quest);
        }

        // Start Gardening quests needing to start
        let GardeningQuestsToStart = await getDurationQuestsToStart(activeQuests);
        for (const quest of GardeningQuestsToStart) {
            await startGardeningQuest(quest, 0); // 0 = one-jewel, 17 = luna-jewel
        }

        setTimeout(() => checkForQuests(), config.pollingInterval);

        console.log(`Waiting for ${config.pollingInterval / 1000} seconds...`);
    } catch (err) {
        console.error(
            `An error occured. Will attempt to retry in ` +
                `${config.pollingInterval / 1000} seconds... Error:`,
            err
        );
        setTimeout(() => checkForQuests(), config.pollingInterval);
    }
}

async function getQuestsToStart(activeQuests) {
    var questsToStart = new Array();
    var questingHeroes = new Array();

    activeQuests.forEach((q) =>
        q.heroes.forEach((h) => questingHeroes.push(Number(h)))
    );

    for (const quest of config.quests) {
        if (quest.professionHeroes.length > 0) {
            var readyHeroes = await getHeroesWithGoodStamina(
                questingHeroes,
                quest,
                config.professionMaxAttempts,
                true,
                0
            );
            questsToStart.push({
                name: quest.name,
                address: quest.contractAddress,
                professional: true,
                heroes: readyHeroes,
                attempts: config.professionMaxAttempts,
            });
        }

        if (quest.nonProfessionHeroes.length > 0) {
            var readyHeroes = await getHeroesWithGoodStamina(
                questingHeroes,
                quest,
                config.nonProfessionMaxAttempts,
                false,
                0
            );
            questsToStart.push({
                name: quest.name,
                address: quest.contractAddress,
                professional: false,
                heroes: readyHeroes,
                attempts: config.nonProfessionMaxAttempts,
            });
        }
    }

    return questsToStart;
}

async function getDurationQuestsToStart(activeQuests) {
    var questsToStart = new Array();
    var questingHeroes = new Array();

    activeQuests.forEach((q) =>
        q.heroes.forEach((h) => questingHeroes.push(Number(h)))
    );

    for (const quest of config.durationQuests) {
        if (quest.professionHeroes.length > 0) {
            // TODO: not very good, but this works, just send when stamina is at 21/25 is fine.
            var readyHeroes = await getHeroesWithGoodStamina(
                questingHeroes,
                quest,
                config.professionMaxAttempts,
                true,
                15
            );
            questsToStart.push({
                name: quest.name,
                address: quest.contractAddress,
                professional: true,
                heroes: readyHeroes,
                attempts: config.professionMaxAttempts,
            });
        }

        if (quest.nonProfessionHeroes.length > 0) {
            var readyHeroes = await getHeroesWithGoodStamina(
                questingHeroes,
                quest,
                config.nonProfessionMaxAttempts,
                false,
                15
            );
            questsToStart.push({
                name: quest.name,
                address: quest.contractAddress,
                professional: false,
                heroes: readyHeroes,
                attempts: config.nonProfessionMaxAttempts,
            });
        }
    }

    return questsToStart;
}

async function getHeroesWithGoodStamina(
    questingHeroes,
    quest,
    maxAttempts,
    professional,
    staminaOveride
) {
    let minStamina = professional ? 5 * maxAttempts : 7 * maxAttempts;
    if (staminaOveride > 0)
    {
        minStamina = staminaOveride
    }

    let heroes = professional
        ? quest.professionHeroes
        : quest.nonProfessionHeroes;
    heroes = heroes.filter((h) => !questingHeroes.includes(h));

    const promises = heroes.map((hero) => {
        return questContract.getCurrentStamina(hero);
    });

    const results = await Promise.all(promises);

    const heroesWithGoodStaminaRaw = results.map((value, index) => {
        const stamina = Number(value);
        if (stamina >= minStamina) {
            return heroes[index];
        }

        return null;
    });

    const heroesWithGoodStamina = heroesWithGoodStaminaRaw.filter((h) => !!h);

    // TODO: Contract error, fix
    //let hero = await questContract.getHero(lowestStaminaHero)
    //console.log(`${professional ? "Professional" : "Non-professional" } ${quest.name} quest due to start at ${displayTime(hero.state.staminaFullAt)}`)

    if (!heroesWithGoodStamina.length) {
        console.log(
            `${professional ? "Professional" : "Non-professional"} ${
                quest.name
            } quest is not ready to start.`
        );
    }

    return heroesWithGoodStamina;
}

async function startQuest(quest) {
    try {
        let batch = 0;
        while (true) {
            var groupStart = batch * config.maxQuestGroupSize;
            let questingGroup = quest.heroes.slice(
                groupStart,
                groupStart + config.maxQuestGroupSize
            );
            if (questingGroup.length === 0) break;

            await startQuestBatch(quest, questingGroup);
            batch++;
        }
    } catch (err) {
        console.warn(
            `Error determining questing group - this will be retried next polling interval`
        );
    }
}

function gardeningQuestPattern(heroIdInt, poolIdInt) {

    let heroIdHex = numberToHex(heroIdInt).substring(2).padStart(64,'0');
    let poolIdHex = numberToHex(poolIdInt).substring(2).padStart(64,'0');
    let rv = ""
    rv += "0xf51333f5" // signature of startQuestWithData
    rv += "0000000000000000000000000000000000000000000000000000000000000080" // not sure
    rv += "000000000000000000000000e4154b6e5d240507f9699c730a496790a722df19" // GardeningQuest Contract
    rv += "0000000000000000000000000000000000000000000000000000000000000001" // ?
    rv += "00000000000000000000000000000000000000000000000000000000000000c0" // ?
    rv += "0000000000000000000000000000000000000000000000000000000000000001" // ? 
    rv += heroIdHex // heroid
    rv += poolIdHex // poolid (0x0 = one-jewel, 0x11=luna-jewel)
    rv += "0000000000000000000000000000000000000000000000000000000000000000" // ?
    rv += "0000000000000000000000000000000000000000000000000000000000000000" // ?
    rv += "0000000000000000000000000000000000000000000000000000000000000000" // ?
    rv += "0000000000000000000000000000000000000000000000000000000000000000" // ?
    rv += "0000000000000000000000000000000000000000000000000000000000000000" // ?
    rv += "0000000000000000000000000000000000000000000000000000000000000180" // ? - pool id?
    rv += "00000000000000000000000000000000000000000000000000000000000001a0" // ? - pool id?
    rv += "0000000000000000000000000000000000000000000000000000000000000000" // ?
    rv += "0000000000000000000000000000000000000000000000000000000000000000" // ?
    rv += "0000000000000000000000000000000000000000000000000000000000000000" // ?
    rv += "0000000000000000000000000000000000000000000000000000000000000000" // ?
    rv += "0000000000000000000000000000000000000000000000000000000000000000" // ?
    rv += "0000000000000000000000000000000000000000000000000000000000000000" // ?
    return rv;
}

async function startGardeningQuest(quest, gardenID) {
    try {
        if (quest.heroes.length > 0)
        {
            let oneHero = quest.heroes.pop();
            console.log(
                `Starting Gardening Quest for ${oneHero}.`
            );

            const txn = hmy.transactions.newTx({
                to: config.questContract,
                value: new Unit(0).asOne().toWei(),
                // gas limit, you can use string
                gasLimit: '2000000',
                // send token from shardID
                shardID: 0,
                // send token to toShardID
                toShardID: 0,
                // gas Price, you can use Unit class, and use Gwei, then remember to use toWei(), which will be transformed to BN
                gasPrice: new hmy.utils.Unit('30').asGwei().toWei(),
                // tx data
                data: gardeningQuestPattern(oneHero, gardenID)
            });
              
            // sign the transaction use wallet;
            const signedTxn = await hmy.wallet.signTransaction(txn);
            const txnHash = await hmy.blockchain.sendTransaction(signedTxn);
            console.log(txnHash);
            console.log("i think i started a gardening quest..");
        }
    } catch (err) {
        console.warn(
            `Error starting gardening - this will be retried next polling interval`
        );
    }
}

async function startQuestBatch(quest, questingGroup) {
    try {
        console.log(
            `Starting ${
                quest.professional ? "Professional" : "Non-professional"
            } ${quest.name} quest with hero(es) ${questingGroup}.`
        );
        await tryTransaction(
            () =>
                questContract
                    .connect(wallet)
                    .startQuest(
                        questingGroup,
                        quest.address,
                        quest.attempts,
                        callOptions
                    ),
            2
        );
        console.log(
            `Started ${
                quest.professional ? "Professional" : "Non-professional"
            } ${quest.name} quest.`
        );
    } catch (err) {
        console.warn(
            `Error starting quest - this will be retried next polling interval`
        );
    }
}

async function completeQuest(heroId) {
    try {
        console.log(`Completing quest led by hero ${heroId}`);

        let receipt = await tryTransaction(
            () =>
                questContract
                    .connect(wallet)
                    .completeQuest(heroId, callOptions),
            2
        );

        console.log(`\n***** Completed quest led by hero ${heroId} *****\n`);

        let xpEvents = receipt.events.filter((e) => e.event === "QuestXP");
        console.log(
            `XP: ${xpEvents.reduce(
                (total, result) => total + Number(result.args.xpEarned),
                0
            )}`
        );

        let suEvents = receipt.events.filter((e) => e.event === "QuestSkillUp");
        console.log(
            `SkillUp: ${
                suEvents.reduce(
                    (total, result) => total + Number(result.args.skillUp),
                    0
                ) / 10
            }`
        );

        let rwEvents = receipt.events.filter((e) => e.event === "QuestReward");
        rwEvents.forEach((result) =>
            console.log(
                `${result.args.itemQuantity} x ${getRewardDescription(
                    result.args.rewardItem
                )}`
            )
        );

        console.log("\n*****\n");
    } catch (err) {
        console.warn(
            `Error completing quest for heroId ${heroId} - this will be retried next polling interval`
        );
    }
}

async function tryTransaction(transaction, attempts) {
    for (let i = 0; i < attempts; i++) {
        try {
            var tx = await transaction();
            let receipt = await tx.wait();
            if (receipt.status !== 1)
                throw new Error(`Receipt had a status of ${receipt.status}`);
            return receipt;
        } catch (err) {
            if (i === attempts - 1) throw err;
        }
    }
}

function getRewardDescription(rewardAddress) {
    let desc = rewardLookup[rewardAddress];
    return desc ? desc : rewardAddress;
}

function getRpc() {
    if (config.useRpcIndex == 1)
        return config.rpc.poktRpc
    if (config.useRpcIndex == 2)
        return config.rpc.otherRpc

    return config.rpc.harmonyRpc;
}

function displayTime(timestamp) {
    var a = new Date(timestamp * 1000);
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    return hour + ":" + min + ":" + sec;
}

main();
