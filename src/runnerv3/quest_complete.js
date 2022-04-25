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

const questABI_21apr2022 = require('./abi/questABI_21apr2022.json')
let questContract = hmy.contracts.createContract(
    questABI_21apr2022,
    config.questContract_21Apr2022,   
    {
        defaultGas: config.gasLimit,
        defaultGasPrice: config.gasPrice
    });

const LocalSignOn = true;

function completeQuestPattern(heroID)
{
    let rv = ""
    rv += "0x528be0a9" // Complete Quest
    rv += autils.intToInput(heroID) // hero id
    return rv
}

exports.CompleteQuests = async (heroesStruct, _questContract) => {

    if (heroesStruct.completedQuesters.length > 0)
    {
        const completedHeroId = heroesStruct.completedQuesters[0];
        const txn = hmy.transactions.newTx({
            // contract address
            to: _questContract,
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
            data: completeQuestPattern(completedHeroId)
        });
          
        // sign the transaction use wallet;
        const signedTxn = await hmy.wallet.signTransaction(txn);
        //  console.log(signedTxn);
        if (LocalSignOn === true)
        {
            const txnHash = await hmy.blockchain.sendTransaction(signedTxn);
            console.log("!!! sending the message on the wire !!!");
            console.log("Completed Quest for heroid:" + completedHeroId);
            //autils.logRewards(txnHash.result);
            return 1;
        }
    }
    return 0;
}
