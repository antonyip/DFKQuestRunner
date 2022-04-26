const { Harmony } = require('@harmony-js/core');
const {
    ChainID,
    ChainType,
  } = require('@harmony-js/utils');

const config = require("./config.json");
const autils = require("./autils")

const hmy = new Harmony(
    autils.getRpc(config.useRpcIndex),
    {
        chainType: ChainType.Harmony,
        chainId: ChainID.HmyMainnet,
    },
);
hmy.wallet.addByPrivateKey(process.env.ETH_PRIVATE_KEY);




exports.runSalesLogic = (heroesStruct) => {
    // foreach Hero in Array
        // if i own the hero still
            // if hero has >= 25 stam and is on sale
                // unlist hero
                // quest hero
            // if hero has < 5 stam and is not on sale
                // list hero
}

const checkHeroOwnerIsMe = (heroID) => {
    
}

const checkHeroStam = (heroID) => {
    
}

const checkHeroOnSale = (heroID) => {
    
}

const unlistHero = (heroID) => {

}

const questHero = (heroID) => {

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