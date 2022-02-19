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

const config = require("./config.json");
const rewardLookup = require("./rewards.json");
const autils = require("./autils")
const abi = require("./abi.json")
const GlobalSignOn = true;

let eBreakCount = 0;
const eBreakLimit = 5;

const hmy = new Harmony(
    autils.getRpc(config.useRpcIndex),
    {
        chainType: ChainType.Harmony,
        chainId: ChainID.HmyMainnet,
    },
);

hmy.wallet.addByPrivateKey(process.env.ETH_PRIVATE_KEY);

let questContract = hmy.contracts.createContract(
    abi,
    config.questContract,   
    {
        defaultGas: config.gasLimit,
        defaultGasPrice: config.gasPrice
    })
/*
let heroContract = hmy.contracts.createContract(
    abi,
    config.heroContract,   
    {
        defaultGas: config.gasLimit,
        defaultGasPrice: config.gasPrice
    })
*/
async function getActiveQuests()
{
    let results = await questContract.methods.getActiveQuests(config.wallet).call()
    return results
}

function completeQuestPattern(heroID)
{
    let rv = ""
    rv += "0x528be0a9" // Complete Quest
    rv += intToInput(heroID) // ?
    return rv
}

async function CompleteQuests(heroesStruct)
{
    if (heroesStruct.completedQuesters.length > 0)
    {
        const completedHeroId = heroesStruct.completedQuesters[0];
        // let GasLimit = await hmy.blockchain.estimateGas({ 
        //     from: config.wallet,
        //     to: config.questContract,
        //     shardID: 0,
        //     data: completeQuestPattern(completedHeroId)
        // })

        const txn = hmy.transactions.newTx({
            to: config.questContract,
            value: new Unit(0).asOne().toWei(),
            // gas limit, you can use string
            gasLimit: config.gasLimit,
            // send token from shardID
            shardID: 0,
            // send token to toShardID
            toShardID: 0,
            // gas Price, you can use Unit class, and use Gwei, then remember to use toWei(), which will be transformed to BN
            gasPrice: new hmy.utils.Unit('30').asGwei().toWei(),
            // tx data
            data: completeQuestPattern(completedHeroId)
        });
          
        // sign the transaction use wallet;
        const signedTxn = await hmy.wallet.signTransaction(txn);
        //  console.log(signedTxn);
        if (GlobalSignOn === true)
        {
            const txnHash = await hmy.blockchain.sendTransaction(signedTxn);
            console.log("!!! sending the message on the wire !!!");
            ++eBreakCount;
            console.log("Completed Quest for heroid:" + completedHeroId);
            
        }
    }

    return;
}

function intToInput(myint)
{
    return numberToHex(myint).substring(2).padStart(64,"0");
}

function fishingPattern(hero1,hero2,hero3,hero4,hero5,hero6,attempts)
{
    if (hero1 === 0)
    {
        throw new Error("Tried to send create a fishing pattern withing heroes")
        return ""
    }

    let rv = ""
    rv += "0xc855dea3" // start Quest
    rv += "0000000000000000000000000000000000000000000000000000000000000060" // ?
    rv += "000000000000000000000000e259e8386d38467f0e7ffedb69c3c9c935dfaefc" // quest
    let heroCount = 0;
    if (hero1 > 0) { ++heroCount; }
    if (hero2 > 0) { ++heroCount; }
    if (hero3 > 0) { ++heroCount; }
    if (hero4 > 0) { ++heroCount; }
    if (hero5 > 0) { ++heroCount; }
    if (hero6 > 0) { ++heroCount; }

    rv += intToInput(attempts); // attempts
    rv += intToInput(heroCount); // hero count

    if (hero1 > 0) { rv += intToInput(hero1); }
    if (hero2 > 0) { rv += intToInput(hero2); }
    if (hero3 > 0) { rv += intToInput(hero3); }
    if (hero4 > 0) { rv += intToInput(hero4); }
    if (hero5 > 0) { rv += intToInput(hero5); }
    if (hero6 > 0) { rv += intToInput(hero6); }

    return rv;
}

function foragingPattern(hero1,hero2,hero3,hero4,hero5,hero6,attempts)
{
    if (hero1 === 0)
    {
        throw new Error("Tried to send create a fishing pattern withing heroes")
        return ""
    }

    let rv = ""
    rv += "0xc855dea3" // start Quest
    rv += "0000000000000000000000000000000000000000000000000000000000000060" // ?
    rv += "0000000000000000000000003132c76acf2217646fb8391918d28a16bd8a8ef4" // quest
    let heroCount = 0;
    if (hero1 > 0) { ++heroCount; }
    if (hero2 > 0) { ++heroCount; }
    if (hero3 > 0) { ++heroCount; }
    if (hero4 > 0) { ++heroCount; }
    if (hero5 > 0) { ++heroCount; }
    if (hero6 > 0) { ++heroCount; }

    rv += intToInput(attempts); // attempts
    rv += intToInput(heroCount); // hero count

    if (hero1 > 0) { rv += intToInput(hero1); }
    if (hero2 > 0) { rv += intToInput(hero2); }
    if (hero3 > 0) { rv += intToInput(hero3); }
    if (hero4 > 0) { rv += intToInput(hero4); }
    if (hero5 > 0) { rv += intToInput(hero5); }
    if (hero6 > 0) { rv += intToInput(hero6); }

    return rv;
}

function goldMiningPattern(hero1,hero2,hero3,hero4,hero5,hero6)
{
    if (hero1 === 0)
    {
        throw new Error("Tried to send create a fishing pattern withing heroes")
        return ""
    }

    let rv = ""
    rv += "0xc855dea3" // start Quest
    rv += "0000000000000000000000000000000000000000000000000000000000000060" // ?
    rv += "000000000000000000000000569e6a4c2e3af31b337be00657b4c040c828dd73" // quest
    let heroCount = 0;
    if (hero1 > 0) { ++heroCount; }
    if (hero2 > 0) { ++heroCount; }
    if (hero3 > 0) { ++heroCount; }
    if (hero4 > 0) { ++heroCount; }
    if (hero5 > 0) { ++heroCount; }
    if (hero6 > 0) { ++heroCount; }

    rv += intToInput(1); // attempts
    rv += intToInput(heroCount); // hero count

    if (hero1 > 0) { rv += intToInput(hero1); }
    if (hero2 > 0) { rv += intToInput(hero2); }
    if (hero3 > 0) { rv += intToInput(hero3); }
    if (hero4 > 0) { rv += intToInput(hero4); }
    if (hero5 > 0) { rv += intToInput(hero5); }
    if (hero6 > 0) { rv += intToInput(hero6); }

    return rv;
}

function gardeningQuestPattern(heroIdInt, poolIdInt) {

    let rv = ""
    rv += "0xf51333f5" // signature of startQuestWithData
    rv += "0000000000000000000000000000000000000000000000000000000000000080" // not sure - some random checksum
    rv += "000000000000000000000000e4154b6e5d240507f9699c730a496790a722df19" // GardeningQuest Contract
    rv += "0000000000000000000000000000000000000000000000000000000000000001" // attempts
    rv += "00000000000000000000000000000000000000000000000000000000000000c0" // ?
    rv += "0000000000000000000000000000000000000000000000000000000000000001" // ? 
    rv += intToInput(heroIdInt) // heroid
    rv += intToInput(poolIdInt) // poolid (0x0 = one-jewel, 0x11=luna-jewel)
    rv += "0000000000000000000000000000000000000000000000000000000000000000" // ?
    rv += "0000000000000000000000000000000000000000000000000000000000000000" // ?
    rv += "0000000000000000000000000000000000000000000000000000000000000000" // ?
    rv += "0000000000000000000000000000000000000000000000000000000000000000" // ?
    rv += "0000000000000000000000000000000000000000000000000000000000000000" // ?
    rv += "0000000000000000000000000000000000000000000000000000000000000180" // ?
    rv += "00000000000000000000000000000000000000000000000000000000000001a0" // ?
    rv += "0000000000000000000000000000000000000000000000000000000000000000" // ?
    rv += "0000000000000000000000000000000000000000000000000000000000000000" // ?
    rv += "0000000000000000000000000000000000000000000000000000000000000000" // ?
    rv += "0000000000000000000000000000000000000000000000000000000000000000" // ?
    rv += "0000000000000000000000000000000000000000000000000000000000000000" // ?
    rv += "0000000000000000000000000000000000000000000000000000000000000000" // ?
    return rv;
}

async function CheckAndSendFishers(heroesStruct, isPro)
{
    let questType = config.quests[0]
    if (questType.name !== "Fishing")
    {
        throw new Error("config index was changed");
    }

    let minBatch = isPro ? questType.professionHeroes.length : questType.nonProfessionHeroes.length;
    let maxBatch = 6;
    let proStamUsage = 5;
    let normStamUsage = 7;
    let minStam = isPro ? questType.proMinStam : questType.normMinStam;
    let proFishingTries = Math.round(minStam/proStamUsage);
    let normFishingTries = Math.round(minStam/normStamUsage);
    let fishingTries = isPro ? proFishingTries : normFishingTries;

    let activeQuesters = heroesStruct.allQuesters
    let configFishers = isPro ? questType.professionHeroes : questType.nonProfessionHeroes

    //console.log(activeQuesters);
    //console.log(configFishers);
    let possibleFishers = configFishers.filter((e) => {
        return (activeQuesters.indexOf(e) < 0);
      });

    let FisherPromises = []
    possibleFishers.forEach(fisher => {
        FisherPromises.push(questContract.methods.getCurrentStamina(fisher).call())
    });

    let staminaValues = await Promise.all(FisherPromises)
    //console.log("fsh stam: " + staminaValues);
    
    // Batching fishers. we only take 6. -> next iteration then we go again
    LocalBatching = []
    for (let index = 0; index < possibleFishers.length; index++) {
        const stam = staminaValues[index];
        if ( stam >= minStam )
        {
            LocalBatching.push(possibleFishers[index]);
        }

        // list full
        if (LocalBatching.length === maxBatch)
        {
            break;
        }
    }

    let numHeroesToSend = LocalBatching.length;
    // fill the last batch up
    if (LocalBatching.length > 0)
    {
        while(LocalBatching.length < maxBatch)
        {
            LocalBatching.push(0)
        }
    }

    console.log("Fishing Batches" + (isPro ? " (P): " : " (N): ") + LocalBatching)

    // be lazy only send 1 batch for now.. next minute can send another
    if (numHeroesToSend >= minBatch && minBatch > 0)
    {
        // let GasLimit = await hmy.blockchain.estimateGas({ 
        //     to: config.questContract,
        //     shardID: 0,
        //     data: fishingPattern(LocalBatching[0],LocalBatching[1],LocalBatching[2],LocalBatching[3],LocalBatching[4],LocalBatching[5],fishingTries) })

        const txn = hmy.transactions.newTx({
            to: config.questContract,
            value: new Unit(0).asOne().toWei(),
            // gas limit, you can use string
            gasLimit: config.gasLimit,
            // send token from shardID
            shardID: 0,
            // send token to toShardID
            toShardID: 0,
            // gas Price, you can use Unit class, and use Gwei, then remember to use toWei(), which will be transformed to BN
            gasPrice: new hmy.utils.Unit('30').asGwei().toWei(),
            // tx data
            data: fishingPattern(LocalBatching[0],LocalBatching[1],LocalBatching[2],LocalBatching[3],LocalBatching[4],LocalBatching[5],fishingTries)
        });
          
        // sign the transaction use wallet;
        const signedTxn = await hmy.wallet.signTransaction(txn);
        //  console.log(signedTxn);
        if (GlobalSignOn === true)
        {
            const txnHash = await hmy.blockchain.sendTransaction(signedTxn);
            console.log("!!! sending the message on the wire !!!");
            ++eBreakCount;
            //  console.log(txnHash);
        }
        
        console.log("Sent " + LocalBatching + " on a Fishing Quest")
    }
    
    return;
}
async function CheckAndSendForagers(heroesStruct, isPro)
{
    // too lazy to change struct in config
    let questType = config.quests[1]
    if (questType.name !== "Foraging")
    {
        throw new Error("config index was changed");
    }

    let minBatch = isPro ? questType.professionHeroes.length : questType.nonProfessionHeroes.length;
    let maxBatch = 6;
    let proStamUsage = 5;
    let normStamUsage = 7;
    let minStam = isPro ? questType.proMinStam : questType.normMinStam;
    let proForagingTries = Math.round(minStam/proStamUsage);
    let normForagingTries = Math.round(minStam/normStamUsage);
    let foragingTries = isPro ? proForagingTries : normForagingTries;

    let activeQuesters = heroesStruct.allQuesters
    let configForagers = isPro ? questType.professionHeroes : questType.nonProfessionHeroes
    //console.log(activeQuesters);
    //console.log(configForagers);
    let possibleForagers = configForagers.filter((e) => {
        return (activeQuesters.indexOf(e) < 0);
      });

    let ForagerPromises = []
    possibleForagers.forEach(hero => {
        ForagerPromises.push(questContract.methods.getCurrentStamina(hero).call())
    });

    let staminaValues = await Promise.all(ForagerPromises)

    // Batching foragers. we only take 6. -> next iteration then we go again
    LocalBatching = []
    for (let index = 0; index < possibleForagers.length; index++) {
        const stam = staminaValues[index];
        if ( stam >= minStam )
        {
            LocalBatching.push(possibleForagers[index]);
        }

        // list full
        if (LocalBatching.length === maxBatch)
        {
            break;
        }
    }


    let numHeroesToSend = LocalBatching.length;
    // fill the last batch up
    if (LocalBatching.length > 0)
    {
        while(LocalBatching.length < maxBatch)
        {
            LocalBatching.push(0)
        }
    }

    console.log("Forager Batches" + (isPro ? " (P): " : " (N): ") + LocalBatching)

    // be lazy only send 1 batch for now.. next minute can send another
    
    if (numHeroesToSend >= minBatch && minBatch > 0)
    {
        // let GasLimit = await hmy.blockchain.estimateGas({ 
        //     to: config.questContract,
        //     shardID: 0,
        //     data: foragingPattern(LocalBatching[0],LocalBatching[1],LocalBatching[2],LocalBatching[3],LocalBatching[4],LocalBatching[5],foragingTries) })

        const txn = hmy.transactions.newTx({
            to: config.questContract,
            value: new Unit(0).asOne().toWei(),
            // gas limit, you can use string
            gasLimit: config.gasLimit,
            // send token from shardID
            shardID: 0,
            // send token to toShardID
            toShardID: 0,
            // gas Price, you can use Unit class, and use Gwei, then remember to use toWei(), which will be transformed to BN
            gasPrice: new hmy.utils.Unit('30').asGwei().toWei(),
            // tx data
            data: foragingPattern(LocalBatching[0],LocalBatching[1],LocalBatching[2],LocalBatching[3],LocalBatching[4],LocalBatching[5],foragingTries)
        });
          
        // sign the transaction use wallet;
        const signedTxn = await hmy.wallet.signTransaction(txn);
        //  console.log(signedTxn);
        if (GlobalSignOn === true)
        {
            const txnHash = await hmy.blockchain.sendTransaction(signedTxn);
            console.log("!!! sending the message on the wire !!!");
            ++eBreakCount;
            //  console.log(txnHash);
        }
        
        console.log("Sent " + LocalBatching + " on a " + (isPro ? "professional" : "normal") + "Foraging Quest")
    }
    
    return;
}
async function CheckAndSendGoldMiners(heroesStruct, isPro)
{
    // too lazy to change struct in config
    let questType = config.quests[3]
    if (questType.name !== "GoldMining")
    {
        throw new Error("GoldMining config index was changed");
    }

    let minBatch = isPro ? questType.professionHeroes.length : questType.nonProfessionHeroes.length;
    let maxBatch = 6;
    let minStam = isPro ? questType.proMinStam : questType.normMinStam;

    let activeQuesters = heroesStruct.allQuesters
    let configGoldMiners = isPro ? questType.professionHeroes : questType.nonProfessionHeroes
    //console.log(activeQuesters);
    //console.log(configForagers);
    let possibleGoldMiners = configGoldMiners.filter((e) => {
        return (activeQuesters.indexOf(e) < 0);
      });

    let GoldMinerPromises = []
    possibleGoldMiners.forEach(fisher => {
        GoldMinerPromises.push(questContract.methods.getCurrentStamina(fisher).call())
    });

    let staminaValues = await Promise.all(GoldMinerPromises)

    
    // Batching heroes. we only take 6. -> next iteration then we go again
    LocalBatching = []
    for (let index = 0; index < possibleGoldMiners.length; index++) {
        const stam = staminaValues[index];
        if ( stam >= minStam )
        {
            LocalBatching.push(possibleGoldMiners[index]);
        }

        // list full
        if (LocalBatching.length === maxBatch)
        {
            break;
        }
    }

    let numHeroesToSend = LocalBatching.length;

    // fill the last batch up
    if (LocalBatching.length > 0)
    {
        while(LocalBatching.length < maxBatch)
        {
            LocalBatching.push(0)
        }
    }

    console.log("Gold Miner Batches" + (isPro ? " (P): " : " (N): ") + LocalBatching)

    // be lazy only send 1 batch for now.. next minute can send another
    
    if (numHeroesToSend >= minBatch && minBatch > 0)
    {
        // let GasLimit = await hmy.blockchain.estimateGas({ 
        //     to: config.questContract,
        //     shardID: 0,
        //     data: goldMiningPattern(LocalBatching[0],LocalBatching[1],LocalBatching[2],LocalBatching[3],LocalBatching[4],LocalBatching[5]) })

        const txn = hmy.transactions.newTx({
            to: config.questContract,
            value: new Unit(0).asOne().toWei(),
            // gas limit, you can use string
            gasLimit: config.gasLimit,
            // send token from shardID
            shardID: 0,
            // send token to toShardID
            toShardID: 0,
            // gas Price, you can use Unit class, and use Gwei, then remember to use toWei(), which will be transformed to BN
            gasPrice: new hmy.utils.Unit('30').asGwei().toWei(),
            // tx data
            data: goldMiningPattern(LocalBatching[0],LocalBatching[1],LocalBatching[2],LocalBatching[3],LocalBatching[4],LocalBatching[5])
        });
          
        
        // sign the transaction use wallet;
        const signedTxn = await hmy.wallet.signTransaction(txn);
        //  console.log(signedTxn);
        if (GlobalSignOn === true)
        {
            const txnHash = await hmy.blockchain.sendTransaction(signedTxn);
            console.log("!!! sending the message on the wire !!!");
            ++eBreakCount;
            //  console.log(txnHash);
        }
        
        console.log("Sent " + LocalBatching + " on a Gold Mining Quest")
    }
    
    return;
}

async function CheckAndSendGardeners(heroesStruct, isPro)
{
    // too lazy to change struct in config
    let questType = config.quests[5]
    if (questType.name !== "Gardening")
    {
        throw new Error("Gardening config index was changed");
    }
    
    let minStam = isPro ? questType.proMinStam : questType.normMinStam

    let activeQuesters = heroesStruct.allQuesters
    let configGardeners = isPro ? questType.professionHeroes : questType.nonProfessionHeroes
    let liquidityPoolID = questType.poolID;
    //console.log(activeQuesters);
    //console.log(configForagers);
    let possibleGardeners = configGardeners.filter((e) => {
        return (activeQuesters.indexOf(e) < 0);
      });

    let GardenerPromises = []
    possibleGardeners.forEach(fisher => {
        GardenerPromises.push(questContract.methods.getCurrentStamina(fisher).call())
    });

    let staminaValues = await Promise.all(GardenerPromises)

    LocalBatching = []
    for (let index = 0; index < possibleGardeners.length; index++) {
        const stam = staminaValues[index];
        if ( stam >= minStam )
        {
            LocalBatching.push(possibleGardeners[index]);
        }
    }

    console.log("Gardeners To Send" + (isPro ? " (P): " : " (N): ") + LocalBatching)

    if (LocalBatching.length > 0)
    {
        // let GasLimit = await hmy.blockchain.estimateGas({ 
        //     to: config.questContract,
        //     shardID: 0,
        //     data: gardeningQuestPattern(LocalBatching[0],liquidityPoolID)
        // })
        
        const txn = hmy.transactions.newTx({
            to: config.questContract,
            value: new Unit(0).asOne().toWei(),
            // gas limit, you can use string
            gasLimit: config.gasLimit,
            // send token from shardID
            shardID: 0,
            // send token to toShardID
            toShardID: 0,
            // gas Price, you can use Unit class, and use Gwei, then remember to use toWei(), which will be transformed to BN
            gasPrice: new hmy.utils.Unit('30').asGwei().toWei(),
            // tx data
            data: gardeningQuestPattern(LocalBatching[0],liquidityPoolID)
        });
          
        // sign the transaction use wallet;
        const signedTxn = await hmy.wallet.signTransaction(txn);
        //  console.log(signedTxn);
        if (GlobalSignOn === true)
        {
            const txnHash = await hmy.blockchain.sendTransaction(signedTxn);
            console.log("!!! sending the message on the wire !!!");
            ++eBreakCount;
            //  console.log(txnHash);
        }
        
        console.log("Sent " + LocalBatching + " on a Garderning Quest")
    }
    
    return;
}

function ParseActiveQuests(activeQuests)
{
    let leadQuestersArray = [];
    let allQuestersArray = [];
    let completedQuestsArray = [];
    let completedQuestersCountArray = []
    activeQuests.forEach(element => {
        leadQuestersArray.push(element.heroes[0].toString());
        let questCompletedDate = new Date(element.completeAtTime*1000)
        if (questCompletedDate < Date.now())
        {
            completedQuestsArray.push(element.heroes[0].toString());
            completedQuestersCountArray.push(element.heroes.length);
        }
        autils.log(element.heroes[0].toString() + " Questing till: " +  questCompletedDate.toLocaleTimeString())
        element.heroes.forEach(hero => {
            allQuestersArray.push(hero.toString());
        })
    });

    let rv = {
        leadQuesters: leadQuestersArray,
        allQuesters: allQuestersArray,
        completedQuesters: completedQuestsArray,
        completedQuestersCount: completedQuestersCountArray
    }
    return rv;
}

// ==========================================
async function main() {
    try {
        
        console.log(" --" + new Date().toLocaleTimeString());
        const oldLimit = eBreakCount;
        if (eBreakCount > eBreakLimit)
        {
            console.log("eBreakLimit Hit!!");
            process.exit(0);
        }

        let activeQuests = await getActiveQuests();

        let heroesStruct = ParseActiveQuests(activeQuests);
        console.log(heroesStruct);

        await CompleteQuests(heroesStruct);

        await CheckAndSendFishers(heroesStruct, false);
        await CheckAndSendFishers(heroesStruct, true);
        await CheckAndSendForagers(heroesStruct, false);
        await CheckAndSendForagers(heroesStruct, true);
        await CheckAndSendGoldMiners(heroesStruct, false);
        await CheckAndSendGoldMiners(heroesStruct, true);
        await CheckAndSendGardeners(heroesStruct, false);
        await CheckAndSendGardeners(heroesStruct, true);

        if (oldLimit === eBreakCount)
        {
            eBreakCount = 0;
        }

        console.log("runok!");
        console.log(" ");

    }
    catch(error)
    {
        eBreakCount += 1;
        autils.log(error);
    }
}

autils.log("hello world");
main()
setInterval(main, config.pollingInterval*1000);
