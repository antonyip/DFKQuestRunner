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
const autils = require("./autils")
const abi = require("./abi.json")
const questABI_21apr2022 = require('./questABI_21apr2022.json')
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
async function getActiveQuests(latestBlock)
{
    questContract.defaultBlock = latestBlock;
    let results = await questContract.methods.getActiveQuests(config.wallet).call()
    return results
}

async function getActiveAccountQuests(latestBlock)
{
    let results = await questContract_21Apr2022.methods.getAccountActiveQuests(config.wallet).call()
    return results
}


function completeQuestPattern(heroID)
{
    let rv = ""
    rv += "0x528be0a9" // Complete Quest
    rv += intToInput(heroID) // ?
    return rv
}

async function CompleteQuests(heroesStruct, _questContract)
{
    if (heroesStruct.completedQuesters.length > 0)
    {
        const completedHeroId = heroesStruct.completedQuesters[0];
        const txn = hmy.transactions.newTx({
            to: _questContract,
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
        throw new Error("Tried to send create a fishing pattern without heroes")
        return ""
    }

    let rv = ""
    rv += "0x8a2da17b" // start Quest
    rv += "0000000000000000000000000000000000000000000000000000000000000080" // version i think
    rv += "000000000000000000000000adffd2a255b3792873a986895c6312e8fbacfc8b" // quest
    let heroCount = 0;
    if (hero1 > 0) { ++heroCount; }
    if (hero2 > 0) { ++heroCount; }
    if (hero3 > 0) { ++heroCount; }
    if (hero4 > 0) { ++heroCount; }
    if (hero5 > 0) { ++heroCount; }
    if (hero6 > 0) { ++heroCount; }

    rv += intToInput(attempts); // attempts
    rv += "0000000000000000000000000000000000000000000000000000000000000000" // level
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
        throw new Error("Tried to send create a foraging pattern without heroes")
        return ""
    }

    let rv = ""
    rv += "0x8a2da17b" // start Quest
    rv += "0000000000000000000000000000000000000000000000000000000000000080" // version
    rv += "000000000000000000000000b465f4590095dad50fee6ee0b7c6700ac2b04df8" // quest
    let heroCount = 0;
    if (hero1 > 0) { ++heroCount; }
    if (hero2 > 0) { ++heroCount; }
    if (hero3 > 0) { ++heroCount; }
    if (hero4 > 0) { ++heroCount; }
    if (hero5 > 0) { ++heroCount; }
    if (hero6 > 0) { ++heroCount; }

    rv += intToInput(attempts); // attempts
    rv += "0000000000000000000000000000000000000000000000000000000000000000" // level
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
        throw new Error("Tried to send create a gold mining pattern without heroes")
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

function jewelMiningPattern(hero1,hero2,hero3,hero4,hero5,hero6)
{
    if (hero1 === 0)
    {
        throw new Error("Tried to create a jewel mining pattern without heroes")
        return ""
    }

    let rv = ""
    rv += "0xc855dea3" // start Quest
    rv += "0000000000000000000000000000000000000000000000000000000000000060" // ?
    rv += "0000000000000000000000006ff019415ee105acf2ac52483a33f5b43eadb8d0" // quest
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
    let maxBatch = 1;
    minBatch = minBatch > maxBatch ? maxBatch : minBatch;
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
            to: config.questContract_21Apr2022,
            value: new Unit(0).asOne().toWei(),
            // gas limit, you can use string
            gasLimit: config.gasLimit,
            // send token from shardID
            shardID: 0,
            // send token to toShardID
            toShardID: 0,
            // gas Price, you can use Unit class, and use Gwei, then remember to use toWei(), which will be transformed to BN
            gasPrice: config.gasPrice,
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
    let maxBatch = 1;
    minBatch = minBatch > maxBatch ? maxBatch : minBatch;
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
            to: config.questContract_21Apr2022,
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
    possibleJewelMiners.forEach(fisher => {
        JewelMinerPromises.push(questContract.methods.getCurrentStamina(fisher).call())
    });

    let staminaValues = await Promise.all(JewelMinerPromises)

    
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
            gasPrice: new hmy.utils.Unit('30').asGwei().toWei(),
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

const date = require('date-and-time');

function GetCurrentDateTime()
{
    return date.addMinutes(new Date(Date.now()), -2);
}

function ParseActiveQuests(activeQuests)
{
    let leadQuestersArray = [];
    let allQuestersArray = [];
    let completedQuestsArray = [];
    let completedQuestersCountArray = []
    activeQuests.forEach(element => {
        if (element.heroes[0].toString() !== '85100')
        {
            leadQuestersArray.push(element.heroes[0].toString());
            let questCompletedDate = new Date(element.completeAtTime*1000)
            if (questCompletedDate < GetCurrentDateTime())
            {
                completedQuestsArray.push(element.heroes[0].toString());
                completedQuestersCountArray.push(element.heroes.length);
            }
            autils.log(element.heroes[0].toString() + " Questing till: " +  questCompletedDate.toLocaleTimeString())
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
        
        console.log(" --" + new Date().toLocaleTimeString());
        console.log(" Sim:" + GetCurrentDateTime());
        const oldLimit = eBreakCount;
        if (eBreakCount > eBreakLimit)
        {
            console.log("eBreakLimit Hit!!");
            process.exit(0);
        }

        let lastBlock = await GetLatestBlock();
        if (lastBlock <= prevBlock)
        {
            console.log("RPC Lagging..")
            return;
        }
        prevBlock = lastBlock;

        // it also sets the defaultblock
        let activeQuests = await getActiveQuests(lastBlock);
        let activeQuests2 = await getActiveAccountQuests(lastBlock);

        let heroesStruct = ParseActiveQuests(activeQuests);
        let heroesStruct2 = ParseActiveQuests(activeQuests2);
        
        console.log(heroesStruct);
        console.log(heroesStruct2);

        await CompleteQuests(heroesStruct, config.questContract);
        await CompleteQuests(heroesStruct2, config.questContract_21Apr2022);

        await CheckAndSendFishers(heroesStruct2, false);
        await CheckAndSendFishers(heroesStruct2, true);
        await CheckAndSendForagers(heroesStruct2, false);
        await CheckAndSendForagers(heroesStruct2, true);

        await CheckAndSendGoldMiners(heroesStruct, false);
        await CheckAndSendGoldMiners(heroesStruct, true);
        await CheckAndSendJewelMiners(heroesStruct, false);
        await CheckAndSendJewelMiners(heroesStruct, true);
        await CheckAndSendGardeners(heroesStruct, false);
        await CheckAndSendGardeners(heroesStruct, true);

        if (oldLimit === eBreakCount)
        {
            eBreakCount = 0;
        }

        console.log("runok!");
    }
    catch(error)
    {
        if (error.toString().includes('Maximum call stack size exceeded'))
        {
            process.exit(0);
        }
        eBreakCount += 1;
        autils.log(error);
    }
}

async function testingFunc()
{
    //const result = await getActiveAccountQuests(0);
    //const result = await getActiveQuests(0);
    //console.log( result );
    //const quests = ParseActiveQuests(result);
    //CompleteQuests(quests)
        // const txn = hmy.transactions.newTx({
        //     to: config.questContract_21Apr2022,
        //     value: 0,
        //     // gas limit, you can use string
        //     gasLimit: config.gasLimit,
        //     // send token from shardID
        //     shardID: 0,
        //     // send token to toShardID
        //     toShardID: 0,
        //     // gas Price, you can use Unit class, and use Gwei, then remember to use toWei(), which will be transformed to BN
        //     gasPrice: config.gasPrice,
        //     // tx data
        //     data: "0x2e0703dc"
        // });
        //const txn = questContract_21Apr2022.
        // try {
        // const rv = await questContract.methods.completeQuest(85100).send({});
        // console.log(rv);
        // } catch (ex)
        // {
        //     console.log(ex);
        // }
        // sign the transaction use wallet;
        //const signedTxn = await hmy.wallet.signTransaction(txn);
        //console.log(signedTxn);
        //const txnHash = await hmy.blockchain.sendTransaction(signedTxn);
        //console.log(txnHash);
        let activeQuests2 = await getActiveAccountQuests(1);
        console.log(JSON.stringify(activeQuests2))
        return;
}

autils.log("hello world");
testingFunc();
//main()
//setInterval(main, config.pollingInterval*1000);
