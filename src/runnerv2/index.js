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
    console.log(results)
    return results
}

async function CompleteQuests(heroesStruct)
{
    let allPromises = []
    heroesStruct.completedQuesters.forEach( heroId => {
        allPromises.push(questContract.methods.completeQuest(heroId).call())
    })

    await Promise.all(allPromises)

    return;
}

function intToInput(myint)
{
    return numberToHex(myint).substring(2).padStart(64,"0");
}

function fishingPattern(hero1,hero2,hero3,hero4,hero5,hero6)
{
    if (hero1 === 0) return ""

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

    rv += intToInput(5); // attempts
    rv += intToInput(heroCount); // hero count

    if (hero1 > 0) { rv += intToInput(hero1); }
    if (hero2 > 0) { rv += intToInput(hero2); }
    if (hero3 > 0) { rv += intToInput(hero3); }
    if (hero4 > 0) { rv += intToInput(hero4); }
    if (hero5 > 0) { rv += intToInput(hero5); }
    if (hero6 > 0) { rv += intToInput(hero6); }

    return rv;
}

async function CheckAndSendFishers(heroesStruct)
{
    // too lazy to change struct in config
    if (config.quests[0].name !== "Fishing")
    {
        throw new Error("config index was changed");
    }

    let activeQuesters = heroesStruct.allQuesters
    let configFishers = config.quests[0].professionHeroes
    let possibleFishers = configFishers.filter((e) => {
        return activeQuesters.indexOf(e) === -1;
      });

    let FisherPromises = []
    possibleFishers.forEach(fisher => {
        FisherPromises.push(questContract.methods.getCurrentStamina(fisher).call())
    });

    let returnValues = await Promise.all(FisherPromises)

    // possibleFishers
    // returnValues
    FisherPromises = []
    for (let index = 0; index < possibleFishers.length; index++) {
        const stam = returnValues[index];
        if ( stam > 25)
        {
            //FisherPromises.push(questContract.methods.startQuest())
            fishingPattern
        }
    }

    console.log(returnValues);
    
    return;
}
async function CheckAndSendForagers(heroesStruct)
{
    return;
}
async function CheckAndSendGoldMiners(heroesStruct)
{
    return;
}
async function CheckAndSendGardeners(heroesStruct)
{
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
            completedQuestsArray.push(element.heroes[0]);
        }
        autils.log(element.heroes[0].toString() + " Questing till: " +  completedDate)
        element.heroes.forEach(hero => {
            allQuestersArray.push(hero);
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
        autils.log("hello world");
        let activeQuests = await getActiveQuests();

        let heroesStruct = ParseActiveQuests(activeQuests);
        console.log(heroesStruct);

        await CompleteQuests(heroesStruct);

        await CheckAndSendFishers(heroesStruct);
        await CheckAndSendForagers(heroesStruct);
        await CheckAndSendGoldMiners(heroesStruct);
        await CheckAndSendGardeners(heroesStruct);

    }
    catch(error)
    {
        autils.log(error);
    }
}

main()
setInterval(main, config.pollingInterval*1000);
