const { Harmony } = require('@harmony-js/core');
const {
    ChainID,
    ChainType,
  } = require('@harmony-js/utils');

const config = require("./config.json");
const autils = require("./autils")

const { REWARD_ADDRESS_TO_NAME, REWARD_ADDRESS_TO_DECIMAL } = require('./quest_rewards');

const hmy = new Harmony(
    autils.getRpc(config.useRpcIndex),
    {
        chainType: ChainType.Harmony,
        chainId: ChainID.HmyMainnet,
    },
);
hmy.wallet.addByPrivateKey(process.env.ETH_PRIVATE_KEY);

const LocalSignOn = true;

function completeQuestPattern(heroID)
{
    let rv = ""
    rv += "0x528be0a9" // Complete Quest
    rv += autils.intToInput(heroID) // hero id
    return rv
}

const BigIntWithDecimalToString = (amount, decimals) => {
    const amountBN = BigInt(amount);
    if (decimals > 0n)
    {
        return `${(amountBN / decimals).toString(10)}.${amountBN.toString(10).slice(-decimals)}`
    }
    return `${amountBN.toString(10)}`;
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
            const txnHash = await hmy.blockchain.createObservedTransaction(signedTxn);
            console.log("!!! sending the message on the wire !!!");
            console.log("Completed Quest for heroid:" + completedHeroId);
            //console.log(txnHash); // this is the txn hash object
            // printing out rewards
            if (txnHash.txStatus === 'CONFIRMED') {
                autils.rewardLog(txnHash.id);
                txnHash.receipt.logs.forEach((log) => {
                    if (log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef')
                    {
                        const rewardName = REWARD_ADDRESS_TO_NAME[log.address] || log.address;
                        const rewardAmount = BigIntWithDecimalToString(log.data, REWARD_ADDRESS_TO_DECIMAL[log.address] || 0n);
                        autils.rewardLog(`${rewardName}: ${rewardAmount}`);
                    }
                });
            }
            
            return 1;
        }
    }
    return 0;
}

/*
<ref *1> Transaction {
  blockNumbers: [ '0x18915e8' ],
  confirmations: 1,
  confirmationCheck: 1,
  cxStatus: 'NONE',
  cxBlockNumbers: [],
  cxConfirmations: 0,
  cxConfirmationCheck: 0,
  messenger: Messenger {
    chainType: 'hmy',
    chainId: 1,
    Network_ID: 'Local',
    send: [Function (anonymous)],
    subscribe: [Function (anonymous)],
    unsubscribe: [Function (anonymous)],
    provider: HttpProvider {
      middlewares: [Object],
      reqMiddleware: Map(0) {},
      resMiddleware: [Map],
      url: 'https://harmony-0-rpc.gateway.pokt.network',
      fetcher: [Object],
      options: [Object]
    },
    config: { Default: [Object], DefaultWS: [Object] },
    JsonRpc: JsonRpc { toPayload: [Function (anonymous)], messageId: 9 },
    shardProviders: Map(0) {}
  },
  txStatus: 'CONFIRMED',
  emitter: Emitter {
    handlers: {},
    emitter: {
      on: [Function: on],
      off: [Function: off],
      emit: [Function: emit]
    },
    off: [Function: bound off],
    emit: [Function: bound emit],
    resolve: [Function (anonymous)],
    reject: [Function (anonymous)],
    promise: Promise { [Circular *1] },
    then: [Function: bound then]
  },
  id: '0x09548d8aa7c3a91aaaf260f085afcef18ab45f97883e13795b26e95e57de6677',
  shardID: 0,
  from: 'one1pwjrhtjxz0srfyhyc9a08vq5kmpjq2ua54w6aj',
  nonce: 5880,
  gasPrice: BN { negative: 0, words: [ 36281856, 521 ], length: 2, red: null },
  gasLimit: BN { negative: 0, words: [ 10000000 ], length: 1, red: null },
  toShardID: 0,
  to: '0xAa9a289ce0565E4D6548e63a441e7C084E6B52F6',
  value: BN { negative: 0, words: [ 0 ], length: 1, red: null },
  data: '0x528be0a9000000000000000000000000000000000000000000000000000000000002b53e',
  chainId: 1,
  rawTransaction: '0xf88d8216f8850826299e0083989680808094aa9a289ce0565e4d6548e63a441e7c084e6b52f680a4528be0a9000000000000000000000000000000000000000000000000000000000002b53e26a02c0c63290642e804f02ed8ac3d625b651a6337deaf56784d8d7d33feffe63675a0481439d1a6af40e2f3fe780bafd2d41473bfee33881df07406994cb1a1e8426b',
  unsignedRawTransaction: '0xf84d8216f8850826299e0083989680808094aa9a289ce0565e4d6548e63a441e7c084e6b52f680a4528be0a9000000000000000000000000000000000000000000000000000000000002b53e018080',
  signature: {
    recoveryParam: 1,
    r: '0x2c0c63290642e804f02ed8ac3d625b651a6337deaf56784d8d7d33feffe63675',
    s: '0x481439d1a6af40e2f3fe780bafd2d41473bfee33881df07406994cb1a1e8426b',
    v: 28
  },
  receipt: {
    blockHash: '0xe5a65b06829fe6e9b676df493dd5c7b5de9237a1fb79c5cf5ece8f8df42a7f8a',
    blockNumber: '0x18915ea',
    contractAddress: '0x0000000000000000000000000000000000000000',
    cumulativeGasUsed: '0x8333a0',
    from: 'one1pwjrhtjxz0srfyhyc9a08vq5kmpjq2ua54w6aj',
    gasUsed: '0x99c63',
    logs: [
      [Object], [Object],
      [Object], [Object],
      [Object], [Object],
      [Object]
    ],
    logsBloom: '0x00000000000000000008000000000000200000000000000000100000000000000020002000000000000002000010000400000000000001000000800000000001004000000000800000000008000040000000040000000020100100000000800000000004220000000000000002800820000000000010000000000010200000200000000000000000000000000001040000000000000000000000000000000000000000000000000000010000000000000080008000000000040000000000000000000002000000000000000000000200000000000000000000000400000028000480200000000000000000080000000000000000010000004000010000000000',
    root: '0x',
    shardID: 0,
    status: '0x1',
    to: 'one142dz388q2e0y6e2gucayg8nupp8xk5hk62auhh',
    transactionHash: '0x09548d8aa7c3a91aaaf260f085afcef18ab45f97883e13795b26e95e57de6677',
    transactionIndex: '0x7',
    byzantium: true
  }
}
*/

/*
{"address":"0xaa9a289ce0565e4d6548e63a441e7c084e6b52f6","blockHash":"0x947b4aaf0318a89327823f718ec458693b03a1460244d2afeceb6f4ac7546486","blockNumber":"0x18916cc","data":"0x0000000000000000000000000000000000000000000000000000000000012cd40000000000000000000000000000000000000000000000000000000062682b660000000000000000000000000000000000000000000000000000000000000005","logIndex":"0x87","removed":false,"topics":["0xdc5746df27e443efb54d93e1b78111844a3fe5efcabce72a649a9ce2ecbdf8e1","0x0000000000000000000000000000000000000000000000000000000005fc18a9","0x0000000000000000000000000ba43bae4613e03492e4c17af3b014b6c3202b9d"],"transactionHash":"0x0c9c757fef56e5e47b7b32f1e6f46d028c96fef2b1e0f989d0f43d83c3c945eb","transactionIndex":"0xe"}
{"address":"0xadffd2a255b3792873a986895c6312e8fbacfc8b","blockHash":"0x947b4aaf0318a89327823f718ec458693b03a1460244d2afeceb6f4ac7546486","blockNumber":"0x18916cc","data":"0x0000000000000000000000000000000000000000000000000000000000012cd4000000000000000000000000000000000000000000000000000000000000000f","logIndex":"0x88","removed":false,"topics":["0x9c39d9087162b6ffb6a639ad9d9134db96598a684324deb4a05a8cc57fcd7c0e","0x0000000000000000000000000000000000000000000000000000000005fc18a9","0x0000000000000000000000000ba43bae4613e03492e4c17af3b014b6c3202b9d"],"transactionHash":"0x0c9c757fef56e5e47b7b32f1e6f46d028c96fef2b1e0f989d0f43d83c3c945eb","transactionIndex":"0xe"}
{"address":"0x5f753dcdf9b1ad9aabc1346614d1f4746fd6ce5c","blockHash":"0x947b4aaf0318a89327823f718ec458693b03a1460244d2afeceb6f4ac7546486","blockNumber":"0x18916cc","data":"0x0000000000000000000000000000000000000000000000000000000000012cd40000000000000000000000000000000000000000000000000000000000012cd40000000000000000000000000000000000000000000000000000000061c216ab0000000000000000000000000000000000000000000000000000000061c3682b000000000000000000000000000000000000000000000000000000000001268a0000000000000000000000000000000000000000000000000000000000011dcb000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000008a1100c720804108e7208e321424190e4128825114200c72128ce2100e00000846109085310c24204438c811100521ca762002528c8010c009081014e5000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000036c0000000000000000000000000000000000000000000000000000000000000102000000000000000000000000000000000000000000000000000000000000000b000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000070000000000000000000000000000000000000000000000000000000062682b66000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007000000000000000000000000000000000000000000000000000000000000178b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000700000000000000000000000000000000000000000000000000000000000000090000000000000000000000000000000000000000000000000000000000000009000000000000000000000000000000000000000000000000000000000000000b00000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000b000000000000000000000000000000000000000000000000000000000000017b000000000000000000000000000000000000000000000000000000000000003a000000000000000000000000000000000000000000000000000000000000001c0000000000000000000000000000000000000000000000000000000000001b5800000000000000000000000000000000000000000000000000000000000007d000000000000000000000000000000000000000000000000000000000000009c40000000000000000000000000000000000000000000000000000000000000dac000000000000000000000000000000000000000000000000000000000000125c0000000000000000000000000000000000000000000000000000000000001d4c0000000000000000000000000000000000000000000000000000000000001d4c000000000000000000000000000000000000000000000000000000000000157c00000000000000000000000000000000000000000000000000000000000005dc0000000000000000000000000000000000000000000000000000000000000dac00000000000000000000000000000000000000000000000000000000000013880000000000000000000000000000000000000000000000000000000000000fa00000000000000000000000000000000000000000000000000000000000000fa000000000000000000000000000000000000000000000000000000000000007d000000000000000000000000000000000000000000000000000000000000006d600000000000000000000000000000000000000000000000000000000000001f400000000000000000000000000000000000000000000000000000000000001f4000000000000000000000000000000000000000000000000000000000000055f000000000000000000000000000000000000000000000000000000000000067200000000000000000000000000000000000000000000000000000000000005dc000000000000000000000000000000000000000000000000000000000000055f00000000000000000000000000000000000000000000000000000000000006d60000000000000000000000000000000000000000000000000000000000000177000000000000000000000000000000000000000000000000000000000000046500000000000000000000000000000000000000000000000000000000000003e8000000000000000000000000000000000000000000000000000000000000046500000000000000000000000000000000000000000000000000000000000003e8000000000000000000000000000000000000000000000000000000000000017700000000000000000000000000000000000000000000000000000000000000380000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b1","logIndex":"0x89","removed":false,"topics":["0x7be34da84992130f23438d167b22f7f7a246aaaf2d7e9dd3c988ee1672fe40fc","0x0000000000000000000000000ba43bae4613e03492e4c17af3b014b6c3202b9d"],"transactionHash":"0x0c9c757fef56e5e47b7b32f1e6f46d028c96fef2b1e0f989d0f43d83c3c945eb","transactionIndex":"0xe"}
{"address":"0xaa9a289ce0565e4d6548e63a441e7c084e6b52f6","blockHash":"0x947b4aaf0318a89327823f718ec458693b03a1460244d2afeceb6f4ac7546486","blockNumber":"0x18916cc","data":"0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000005fc18a9000000000000000000000000adffd2a255b3792873a986895c6312e8fbacfc8b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000ba43bae4613e03492e4c17af3b014b6c3202b9d0000000000000000000000000000000000000000000000000000000001891698000000000000000000000000000000000000000000000000000000006267de54000000000000000000000000000000000000000000000000000000006267de680000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000012cd4","logIndex":"0x8a","removed":false,"topics":["0x67e26712b58074cdab9610b340e1d33799dd0ec3632073666967c3ab3a95cc37","0x0000000000000000000000000000000000000000000000000000000005fc18a9","0x0000000000000000000000000ba43bae4613e03492e4c17af3b014b6c3202b9d","0x0000000000000000000000000000000000000000000000000000000000012cd4"],"transactionHash":"0x0c9c757fef56e5e47b7b32f1e6f46d028c96fef2b1e0f989d0f43d83c3c945eb","transactionIndex":"0xe"}
*/