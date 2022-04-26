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
            const txnHash = await hmy.blockchain.createObservedTransaction(signedTxn);
            console.log("!!! sending the message on the wire !!!");
            console.log("Completed Quest for heroid:" + completedHeroId);
            //console.log(txnHash); // this is the txn hash object
            // printing out rewards
            if (txnHash.txStatus === 'CONFIRMED'){
                txnHash.receipt.logs.forEach(element => {
                    console.log(JSON.stringify(element));
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
