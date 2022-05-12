const { Harmony } = require('@harmony-js/core');
const {
    ChainID,
    ChainType,
  } = require('@harmony-js/utils');

const config = require("./config.json");
const autils = require("./autils")
const axios = require('axios')
const { SendFisherOnQuest } = require('./quest_fishing');
const { SendForagerOnQuest } = require('./quest_foraging');
const { SendHeroOnStatQuest } = require('./quest_stats');

const LocalSignOn = true;

const hmy = new Harmony(
    autils.getRpc(config.useRpcIndex),
    {
        chainType: ChainType.Harmony,
        chainId: ChainID.HmyMainnet,
    },
);
hmy.wallet.addByPrivateKey(process.env.ETH_PRIVATE_KEY);

const questABI_21apr2022 = require('./abi/questABI_21apr2022.json');
let questContract = hmy.contracts.createContract(
    questABI_21apr2022,
    config.questContract_21Apr2022,   
    {
        defaultGas: config.gasLimit,
        defaultGasPrice: config.gasPrice
    });

const tavernABI_27apr2022 = require('./abi/tavernABI_27apr2022.json')
let tavernContract = hmy.contracts.createContract(
    tavernABI_27apr2022,
    config.tavernContract,
    {
        defaultGas: config.gasLimit,
        defaultGasPrice: config.gasPrice
    });

const heroAbi = require('./abi/heroABI_27apr2022.json')
let heroContract = hmy.contracts.createContract(
    heroAbi,
    config.heroContract,
    {
        defaultGas: config.gasLimit,
        defaultGasPrice: config.gasPrice
    });
    heroContract


exports.runSalesLogic = async () => {

    const heroList = config.heroForSale;
    // get stamina of the registed heroes to be on sale
    const staminaPromises = []
    heroList.forEach((heroToSell) => {
        staminaPromises.push(questContract.methods.getCurrentStamina(parseInt(heroToSell.id, 10)).call(undefined, autils.getLatestBlockNumber()))
    })

    let staminaValues = await Promise.allSettled(staminaPromises)
    staminaValues = staminaValues.map( res => res.value ? Number(res.value) : -1 )
    // console.log('staminaValues', staminaValues);

    // get the current owners of those heroes
    const heroOwnersPromises = []
    heroList.forEach((hero) => {
        heroOwnersPromises.push(heroContract.methods.ownerOf(hero.id).call(undefined, autils.getLatestBlockNumber()));
    });

    let heroOwners = await Promise.allSettled(heroOwnersPromises);
    heroOwners = heroOwners.map( res => res.value || -1)
    console.log('heroOwners', heroOwners);

    let iHeroOwner = 0;
    for (const heroOwner of heroOwners) {
        if (heroOwner === -1)
        {
            // do nothing, promise failed
            return;
        }

        // in the auction house
        if (heroOwner.toLowerCase() === '0x13a65B9F8039E2c032Bc022171Dc05B30c3f2892'.toLowerCase())
        {
            // stamina of hero is more then 24
            if (staminaValues[iHeroOwner] > 24 && staminaValues[iHeroOwner] !== -1)
            {
                // if apiv6 says i own the hero
                // unlist the hero and quest
                if (await isAPIv6Owner(heroList[iHeroOwner].id))
                {
                    // unlist the hero on sale
                    await unlistHero(heroList[iHeroOwner].id);
                    await questHero(heroList[iHeroOwner].id, heroList[iHeroOwner].quest);
                }
            }
        }

        // i own the hero..
        if (heroOwner.toLowerCase() === config.wallet.toLowerCase())
        {
            // stamina of hero is less then 5
            if (staminaValues[iHeroOwner] < 8 && staminaValues[iHeroOwner] !== -1)
            {
                // list the hero on sale
                await listHero(heroList[iHeroOwner].id, heroList[iHeroOwner].price);
            }
        }
        iHeroOwner += 1;
    }
    return;
}

const unlistHero = async (heroID) => {
    const id = parseInt(heroID, 10);
    autils.logSimulation(`unlisting hero: ${id}`);
    const txn = hmy.transactions.newTx({
        // contract address
        to: config.tavernContract,
        // amount of one to send
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
        data: cancelAuctionPattern(id)
    });
    // sign the transaction use wallet;
    const signedTxn = await hmy.wallet.signTransaction(txn);
    if (LocalSignOn === true)
    {
        await hmy.blockchain.createObservedTransaction(signedTxn).promise;
        autils.logSimulation(`unlisting hero: ${id} COMPLETED!`);
    }
    return;
}

const listHero = async (heroID, price) => {
    const id = parseInt(heroID, 10);
    autils.logSimulation(`listing hero: ${parseInt(id)}: ${price}`);
    const txn = hmy.transactions.newTx({
        // contract address
        to: config.tavernContract,
        // amount of one to send
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
        data: createAuctionPattern(id, price)
    });
    // sign the transaction use wallet;
    const signedTxn = await hmy.wallet.signTransaction(txn);
    if (LocalSignOn === true)
    {
        await hmy.blockchain.createObservedTransaction(signedTxn).promise;
        autils.logSimulation(`listing hero: ${id} COMPLETED!`);
    }
    return;
}

const questHero = async (heroID, questType) => {
    const id = parseInt(heroID, 10);
    autils.logSimulation(`questing hero: ${parseInt(id)}: ${questType}`);
    switch (questType) {
        case 'fishing':
            await SendFisherOnQuest(id, 5);
            break;
        case 'foraging':
            await SendForagerOnQuest(id, 5);
            break;
        case 'trash':
            await SendFisherOnQuest(id, 3);
        default:
            break;
    }
    if (questType.includes('StatQuest_'))
    {
        await SendHeroOnStatQuest(id, questType);
    }
    return;
}

const isAPIv6Owner = async (heroID) => {
    let returnValue = false;
    let debugData;
    await axios.post("https://us-central1-defi-kingdoms-api.cloudfunctions.net/query_heroes",
        {"limit":1,"params":[{"field":"id","operator":"=","value":heroID.toString()}],"offset":0}
    ).then( (reply) => {
        debugData = reply;
        if (reply.data[0].owner_address.toLowerCase() === config.wallet.toLowerCase()) {
            returnValue = true;
        }
    }).catch(err => {
        // errors are fine, just say not owned for now, next iteration can will-recheck
        returnValue = false;
    })
    //console.log('debugData', debugData);
    console.log(heroID, ' isAPIv6Owner: ',returnValue);
    return returnValue;
}

/*
0x96b5a755 // cancel auction
000000000000000000000000000000000000000000000000000000000002b8a3 // hero id
*/
const cancelAuctionPattern = (heroID) => {
    let rv = '0x96b5a755'
    rv += autils.intToInput(heroID);
    return rv
}

/*
0x4ee42914 // create auction
000000000000000000000000000000000000000000000000000000000002b114 // hero id
0000000000000000000000000000000000000000000000f0e8e396adcbf00000 // start price
0000000000000000000000000000000000000000000000f0e8e396adcbf00000 // end price
000000000000000000000000000000000000000000000000000000000000003c // duration
0000000000000000000000000000000000000000000000000000000000000000 // private winner
*/

const createAuctionPattern = (heroID, price) => {
    let rv = '0x4ee42914'
    rv += autils.intToInput(heroID);
    const priceInput = (BigInt(price) * BigInt(10 ** 18)).toString(16).padStart(64,'0');
    rv += priceInput // startPrice
    rv += priceInput // endPrice
    rv += '000000000000000000000000000000000000000000000000000000000000003c'
    rv += '0000000000000000000000000000000000000000000000000000000000000000'
    return rv
}