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
const GlobalSignOn = false;

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
    //let results = await questContract.methods.getActiveQuests("0x0Ba43bAe4613E03492e4C17Af3B014B6c3202B9d").call()
    //console.log(results)
    return results
}

async function CompleteQuests(heroesStruct)
{
    let allPromises = []
    heroesStruct.completedQuesters.forEach( heroId => {
        allPromises.push(questContract.methods.completeQuest(heroId).call())
    })

    if (GlobalSignOn === true)
    {
        await Promise.all(allPromises)
    }
    
    if(allPromises.length > 1)
    {
        console.log("Completed some quests :P")
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

async function CheckAndSendFishers(heroesStruct)
{
    let minStam = 5;
    let proStamUsage = 5;
    let normStamUsage = 7;
    let maxBatchFisher = 6;

    // too lazy to change struct in config
    let questType = config.quests[0]
    if (questType.name !== "Fishing")
    {
        throw new Error("config index was changed");
    }

    let activeQuesters = heroesStruct.allQuesters
    let configFishers = questType.professionHeroes
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

    
    // Batching fishers. we only take 6. -> next iteration then we go again
    LocalBatching = []
    for (let index = 0; index < possibleFishers.length; index++) {
        const stam = staminaValues[index];
        if ( stam > minStam)
        {
            LocalBatching.push(possibleFishers[index]);
        }

        // list full
        if (LocalBatching.length === maxBatchFisher)
        {
            break;
        }
    }

    // fill the last batch up
    if (LocalBatching.length > 0)
    {
        while(LocalBatching.length < maxBatchFisher)
        {
            LocalBatching.push(0)
        }
    }

    console.log("Fishing Batches: " + LocalBatching)

    // be lazy only send 1 batch for now.. next minute can send another
    
    if (LocalBatching.length > 0)
    {
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
            data: fishingPattern(LocalBatching[0],LocalBatching[1],LocalBatching[2],LocalBatching[3],LocalBatching[4],LocalBatching[5],5)
        });
          
        // sign the transaction use wallet;
        const signedTxn = await hmy.wallet.signTransaction(txn);
        //  console.log(signedTxn);
        if (GlobalSignOn === true)
        {
            const txnHash = await hmy.blockchain.sendTransaction(signedTxn);
            console.log("sending the message on the wire!!!");
            //  console.log(txnHash);
        }
        
        console.log("Sent " + LocalBatching + " on a Fishing Quest")
    }
    
    return;
}
async function CheckAndSendForagers(heroesStruct)
{
    let minStam = 25;
    let proStamUsage = 5;
    let normStamUsage = 7;
    let maxBatch = 6;

    // too lazy to change struct in config
    let questType = config.quests[1]
    if (questType.name !== "Foraging")
    {
        throw new Error("config index was changed");
    }

    let activeQuesters = heroesStruct.allQuesters
    let configForagers = questType.professionHeroes
    //console.log(activeQuesters);
    //console.log(configForagers);
    let possibleForagers = configForagers.filter((e) => {
        return (activeQuesters.indexOf(e) < 0);
      });

    let ForagerPromises = []
    possibleForagers.forEach(fisher => {
        ForagerPromises.push(questContract.methods.getCurrentStamina(fisher).call())
    });

    let staminaValues = await Promise.all(ForagerPromises)

    
    // Batching foragers. we only take 6. -> next iteration then we go again
    LocalBatching = []
    for (let index = 0; index < possibleForagers.length; index++) {
        const stam = staminaValues[index];
        if ( stam > minStam)
        {
            LocalBatching.push(possibleForagers[index]);
        }

        // list full
        if (LocalBatching.length === maxBatch)
        {
            break;
        }
    }

    // fill the last batch up
    if (LocalBatching.length > 0)
    {
        while(LocalBatching.length < maxBatch)
        {
            LocalBatching.push(0)
        }
    }

    console.log("Forager Batches: " + LocalBatching)

    // be lazy only send 1 batch for now.. next minute can send another
    
    if (LocalBatching.length > 0)
    {
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
            data: foragingPattern(LocalBatching[0],LocalBatching[1],LocalBatching[2],LocalBatching[3],LocalBatching[4],LocalBatching[5],5)
        });
          
        // sign the transaction use wallet;
        const signedTxn = await hmy.wallet.signTransaction(txn);
        //  console.log(signedTxn);
        if (GlobalSignOn === true)
        {
            const txnHash = await hmy.blockchain.sendTransaction(signedTxn);
            console.log("sending the message on the wire!!!");
            //  console.log(txnHash);
        }
        
        console.log("Sent " + LocalBatching + " on a Foraging Quest")
    }
    
    return;
}
async function CheckAndSendGoldMiners(heroesStruct)
{
    let minStam = 5;
    let proStamUsage = 5;
    let normStamUsage = 7;
    let maxBatchFisher = 6;

    // too lazy to change struct in config
    let questType = config.quests[3]
    if (questType.name !== "GoldMining")
    {
        throw new Error("GoldMining config index was changed");
    }

    let activeQuesters = heroesStruct.allQuesters
    let configGoldMiners = questType.nonProfessionHeroes
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
        if ( stam > minStam)
        {
            LocalBatching.push(possibleGoldMiners[index]);
        }

        // list full
        if (LocalBatching.length === maxBatchFisher)
        {
            break;
        }
    }

    // fill the last batch up
    if (LocalBatching.length > 0)
    {
        while(LocalBatching.length < maxBatchFisher)
        {
            LocalBatching.push(0)
        }
    }

    console.log("Gold Miner Batches: " + LocalBatching)

    // be lazy only send 1 batch for now.. next minute can send another
    
    if (LocalBatching.length > 0)
    {
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
            data: goldMiningPattern(LocalBatching[0],LocalBatching[1],LocalBatching[2],LocalBatching[3],LocalBatching[4],LocalBatching[5])
        });
          
        // sign the transaction use wallet;
        const signedTxn = await hmy.wallet.signTransaction(txn);
        //  console.log(signedTxn);
        if (GlobalSignOn === true)
        {
            const txnHash = await hmy.blockchain.sendTransaction(signedTxn);
            console.log("sending the message on the wire!!!");
            //  console.log(txnHash);
        }
        
        console.log("Sent " + LocalBatching + " on a Mining Quest")
    }
    
    return;
}
async function CheckAndSendGardeners(heroesStruct)
{
    let minStam = 15;
    let liquidityPoolID = 0;

    // too lazy to change struct in config
    let questType = config.quests[5]
    if (questType.name !== "Gardening")
    {
        throw new Error("Gardening config index was changed");
    }

    let activeQuesters = heroesStruct.allQuesters
    let configGardeners = questType.professionHeroes
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
        if (stam > minStam)
        {
            LocalBatching.push(possibleGardeners[index]);
        }
    }

    console.log("Garderers To Send: " + LocalBatching)

    if (LocalBatching.length > 0)
    {
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
            data: gardeningQuestPattern(LocalBatching[0],liquidityPoolID)
        });
          
        // sign the transaction use wallet;
        const signedTxn = await hmy.wallet.signTransaction(txn);
        //  console.log(signedTxn);
        if (GlobalSignOn === true)
        {
            const txnHash = await hmy.blockchain.sendTransaction(signedTxn);
            console.log("sending the message on the wire!!!");
            //  console.log(txnHash);
        }
        
        console.log("Sent " + LocalBatching + " on a Garderning Quest")
    }
    
    return;
}

function ParseActiveQuests(activeQuests)
{
    let timenow = new Date();
    let leadQuestersArray = [];
    let allQuestersArray = [];
    let completedQuestsArray = [];
    activeQuests.forEach(element => {
        leadQuestersArray.push(element.heroes[0].toString());
        let completedDate = new Date(element.completeAtTime * 1000).toLocaleTimeString()
        if (completedDate > timenow)
        {
            completedQuestsArray.push(element.heroes[0].toString());
        }
        autils.log(element.heroes[0].toString() + " Questing till: " +  completedDate)
        element.heroes.forEach(hero => {
            allQuestersArray.push(hero.toString());
        })
    });

    let rv = {
        leadQuesters: leadQuestersArray,
        allQuesters: allQuestersArray,
        completedQuesters: completedQuestsArray
    }
    return rv;
}

// ==========================================
async function main() {
    try {
        
        let activeQuests = await getActiveQuests();

        let heroesStruct = ParseActiveQuests(activeQuests);
        //console.log(heroesStruct);

        await CompleteQuests(heroesStruct);

        await CheckAndSendFishers(heroesStruct);
        await CheckAndSendForagers(heroesStruct);
        await CheckAndSendGoldMiners(heroesStruct);
        await CheckAndSendGardeners(heroesStruct);

        console.log("runok!");

    }
    catch(error)
    {
        autils.log(error);
    }
}

autils.log("hello world");
main()
setInterval(main, config.pollingInterval*1000);
