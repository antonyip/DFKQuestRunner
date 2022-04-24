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
            autils.logRewards(txnHash.result);
            return 1;
        }
    }
    return 0;
}

const rewardLookup = require("./rewards.json");

const callOptions = { gasPrice: config.gasPrice, gasLimit: config.gasLimit };

async function completeQuest(heroId) {
    try {
        autils.rewardLog(`Completing quest led by hero ${heroId}`);

        let receipt = await tryTransaction(
            () =>
                questContract
                    .connect(hmy.wallet)
                    .completeQuest(heroId, callOptions),
            2
        );

        autils.rewardLog(`***** Completed quest led by hero ${heroId} *****`);

        let xpEvents = receipt.events.filter((e) => e.event === "QuestXP");
        autils.rewardLog(
            `XP: ${xpEvents.reduce(
                (total, result) => total + Number(result.args.xpEarned),
                0
            )}`
        );

        let suEvents = receipt.events.filter((e) => e.event === "QuestSkillUp");
        autils.rewardLog(
            `SkillUp: ${
                suEvents.reduce(
                    (total, result) => total + Number(result.args.skillUp),
                    0
                ) / 10
            }`
        );

        let rwEvents = receipt.events.filter((e) => e.event === "QuestReward");
        rwEvents.forEach((result) =>
        autils.rewardLog(
                `${result.args.itemQuantity} x ${getRewardDescription(
                    result.args.rewardItem
                )}`
            )
        );

    } catch (err) {
        console.log(err);
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