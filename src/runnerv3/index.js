// external includes
const { Harmony } = require('@harmony-js/core');
const {
    ChainID,
    ChainType,
} = require('@harmony-js/utils');
const date = require('date-and-time');

// internal includes
const config = require("./config.json");
const autils = require("./autils")
const questABI = require("./abi/abi.json")
const questABI_21apr2022 = require('./abi/questABI_21apr2022.json')
const { CompleteQuests } = require('./quest_complete');
const { CheckAndSendFishers } = require('./quest_fishing');
const { CheckAndSendForagers } = require('./quest_foraging');
const { jewelMiningPattern } = require('./quest_jewelmining');
const { goldMiningPattern } = require('./quest_goldmining');
const { gardeningQuestPattern } = require('./quest_gardening');
const { CheckAndSendStatQuests } = require('./quest_stats');

// file local vars
const GlobalSignOn = true;
let eBreakCount = 0;
const eBreakLimit = 10;

const hmy = new Harmony(
    autils.getRpc(config.useRpcIndex),
    {
        chainType: ChainType.Harmony,
        chainId: ChainID.HmyMainnet,
    },
);

hmy.wallet.addByPrivateKey(process.env.ETH_PRIVATE_KEY);

let questContract = hmy.contracts.createContract(
    questABI,
    config.questContract,   
    {
        defaultGas: config.gasLimit,
        defaultGasPrice: config.gasPrice
    });
let questContract_21Apr2022 = hmy.contracts.createContract(
    questABI_21apr2022,
    config.questContract_21Apr2022,   
    {
        defaultGas: config.gasLimit,
        defaultGasPrice: config.gasPrice
    });
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
    let returnValue;
    await questContract.methods.getActiveQuests(config.wallet).call(undefined, autils.getLatestBlockNumber())
    .catch(ex => {
        autils.log(`getActiveQuests failed: ${JSON.stringify(ex)}`, true);
        throw ex;
    }).then((res) => {
        returnValue = res;
    })
    return returnValue;
}

async function getActiveAccountQuests()
{
    await questContract_21Apr2022.methods.getAccountActiveQuests(config.wallet).call(undefined, autils.getLatestBlockNumber())
    .catch(ex => {
        autils.log(`getActiveAccountQuests failed: ${JSON.stringify(ex)}`, true);
        throw ex;
    }).then((res) => {
        returnValue = res;
    })
    return returnValue
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
    let maxBatch = 1;
    minBatch = minBatch > maxBatch ? maxBatch : minBatch;
    let minStam = isPro ? questType.proMinStam : questType.normMinStam;

    let activeQuesters = heroesStruct.allQuesters
    let configGoldMiners = isPro ? questType.professionHeroes : questType.nonProfessionHeroes
    //console.log(activeQuesters);
    //console.log(configForagers);
    let possibleGoldMiners = configGoldMiners.filter((e) => {
        return (activeQuesters.indexOf(e) < 0);
      });

    let GoldMinerPromises = []
    possibleGoldMiners.forEach(hero => {
        GoldMinerPromises.push(questContract.methods.getCurrentStamina(hero).call(undefined, autils.getLatestBlockNumber()))
    });

    let staminaValues;
    await Promise.all(GoldMinerPromises)
    .then((res) => {
        staminaValues = res;
    }).catch((ex) => {
        autils.log(`GoldMinerPromises: ${ex}`, true);
    })
    
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
         const txn = hmy.transactions.newTx({
            to: config.questContract,
            value: 0,
            // gas limit, you can use string
            gasLimit: config.gasLimit,
            // send token from shardID
            shardID: 0,
            // send token to toShardID
            toShardID: 0,
            // gas Price, you can use Unit class, and use Gwei, then remember to use toWei(), which will be transformed to BN
            gasPrice: config.gasPrice,
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

async function CheckAndSendJewelMiners(heroesStruct, isPro)
{
    // too lazy to change struct in config
    let questType = config.quests[4]
    if (questType.name !== "JewelMining")
    {
        throw new Error("JewelMining config index was changed");
    }

    let minBatch = isPro ? questType.professionHeroes.length : questType.nonProfessionHeroes.length;
    let maxBatch = 1;
    minBatch = minBatch > maxBatch ? maxBatch : minBatch;
    let minStam = isPro ? questType.proMinStam : questType.normMinStam;

    let activeQuesters = heroesStruct.allQuesters
    let configJewelMiners = isPro ? questType.professionHeroes : questType.nonProfessionHeroes
    //console.log(activeQuesters);
    //console.log(configForagers);
    let possibleJewelMiners = configJewelMiners.filter((e) => {
        return (activeQuesters.indexOf(e) < 0);
      });

    let JewelMinerPromises = []
    possibleJewelMiners.forEach(hero => {
        JewelMinerPromises.push(questContract.methods.getCurrentStamina(hero).call(undefined, autils.getLatestBlockNumber()))
    });

    let staminaValues;
    await Promise.all(JewelMinerPromises)
    .then((res) => {
        staminaValues = res;
    }).catch((ex) => {
        autils.log(`JewelMinerPromises: ${ex}`, true);
    })
    
    // Batching heroes. we only take 6. -> next iteration then we go again
    LocalBatching = []
    for (let index = 0; index < possibleJewelMiners.length; index++) {
        const stam = staminaValues[index];
        if ( stam >= minStam )
        {
            LocalBatching.push(possibleJewelMiners[index]);
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

    console.log("Jewel Miner Batches" + (isPro ? " (P): " : " (N): ") + LocalBatching)

    // be lazy only send 1 batch for now.. next minute can send another
    
    if (numHeroesToSend >= minBatch && minBatch > 0)
    {
        const txn = hmy.transactions.newTx({
            to: config.questContract,
            value: 0,
            // gas limit, you can use string
            gasLimit: config.gasLimit,
            // send token from shardID
            shardID: 0,
            // send token to toShardID
            toShardID: 0,
            // gas Price, you can use Unit class, and use Gwei, then remember to use toWei(), which will be transformed to BN
            gasPrice: config.gasPrice,
            // tx data
            data: jewelMiningPattern(LocalBatching[0],LocalBatching[1],LocalBatching[2],LocalBatching[3],LocalBatching[4],LocalBatching[5])
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
        
        console.log("Sent " + LocalBatching + " on a Jewel Mining Quest")
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
    possibleGardeners.forEach(hero => {
        GardenerPromises.push(questContract.methods.getCurrentStamina(hero).call(undefined, autils.getLatestBlockNumber()))
    });

    let staminaValues;
    await Promise.all(GardenerPromises)
    .then((res) => {
        staminaValues = res;
    }).catch((ex) => {
        autils.log(`GardenerPromises: ${ex}`, true);
    })

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
        const txn = hmy.transactions.newTx({
            to: config.questContract,
            value: 0,
            // gas limit, you can use string
            gasLimit: config.gasLimit,
            // send token from shardID
            shardID: 0,
            // send token to toShardID
            toShardID: 0,
            // gas Price, you can use Unit class, and use Gwei, then remember to use toWei(), which will be transformed to BN
            gasPrice: config.gasPrice,
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
        
        console.log("Sent " + LocalBatching[0] + " on a Garderning Quest")
    }
    
    return;
}

function GetCurrentDateTime()
{
    return date.addMinutes(new Date(Date.now()), -1);
}

function ParseActiveQuests(activeQuests)
{
    let leadQuestersArray = [];
    let allQuestersArray = [];
    let completedQuestsArray = [];
    let completedQuestersCountArray = []
    activeQuests.forEach(element => {
        if (element.id.toString() !== "16305")
        {
            leadQuestersArray.push(element.heroes[0].toString());
            let questCompletedDate = new Date(element.completeAtTime*1000)
            if (questCompletedDate < GetCurrentDateTime())
            {
                completedQuestsArray.push(element.heroes[0].toString());
                completedQuestersCountArray.push(element.heroes.length);
            }
            console.log(element.heroes[0].toString() + " Questing till: " +  questCompletedDate.toLocaleTimeString())
            element.heroes.forEach(hero => {
                allQuestersArray.push(hero.toString());
            })
        }
    });

    let rv = {
        leadQuesters: leadQuestersArray,
        allQuesters: allQuestersArray,
        completedQuesters: completedQuestsArray,
        completedQuestersCount: completedQuestersCountArray
    }
    return rv;
}

async function GetLatestBlock()
{
    const res = await hmy.blockchain.getBlockNumber(0);
    const lastblock = parseInt(res.result,16);
    console.log('lastblock:', lastblock);
    return lastblock;
}

// ==========================================
let prevBlock = 0;
async function main() {
    try {
        
        console.log("now(): " + new Date().toLocaleTimeString());
        console.log("SimulatedTime: " + GetCurrentDateTime());
        const oldLimit = eBreakCount;
        if (eBreakCount > eBreakLimit)
        {
            autils.log("eBreakLimit Hit!!", true);
            process.exit(0);
        }

        let lastBlock = await GetLatestBlock();
        if (lastBlock <= prevBlock)
        {
            autils.log("RPC Lagging..", true);
            return;
        }
        autils.setLatestBlockNumber(lastBlock);
        prevBlock = lastBlock;

        // it also sets the defaultblock
        let activeQuests = await getActiveQuests();
        let activeQuests2 = await getActiveAccountQuests();

        let heroesStruct = ParseActiveQuests(activeQuests);
        let heroesStruct2 = ParseActiveQuests(activeQuests2);
        
        //console.log(heroesStruct);
        //console.log(heroesStruct2);

        eBreakCount += await CompleteQuests(heroesStruct, config.questContract);
        eBreakCount += await CompleteQuests(heroesStruct2, config.questContract_21Apr2022);

        eBreakCount += await CheckAndSendFishers(heroesStruct2, false);
        eBreakCount += await CheckAndSendFishers(heroesStruct2, true);
        eBreakCount += await CheckAndSendForagers(heroesStruct2, false);
        eBreakCount += await CheckAndSendForagers(heroesStruct2, true);

        await CheckAndSendGoldMiners(heroesStruct, false);
        await CheckAndSendGoldMiners(heroesStruct, true);
        await CheckAndSendJewelMiners(heroesStruct, false);
        await CheckAndSendJewelMiners(heroesStruct, true);
        await CheckAndSendGardeners(heroesStruct, false);
        await CheckAndSendGardeners(heroesStruct, true);

        eBreakCount += await CheckAndSendStatQuests(heroesStruct2);

        if (oldLimit === eBreakCount)
        {
            eBreakCount = 0;
        }

        console.log("runok!");
        console.log("");
    }
    catch(error)
    {
        if (error.toString().includes('Maximum call stack size exceeded'))
        {
            // can't do anything about a memory leak...
            autils.log(error.toString(), true);
            process.exit(0);
        }
        eBreakCount += 1;
        if (error.toString() === '[object Object]')
        {
            autils.log(JSON.stringify(error), true);
        }
        else {
            autils.log(error.toString(), true);
        }
        
    }
}

autils.log("hello world: " + new Date().toDateString(), true);
main()
setInterval(main, config.pollingInterval*1000);
