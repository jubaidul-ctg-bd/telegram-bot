const litecore = require('litecore-lib');
const request = require("axios");

let response = {
    error:1,
    message:'Unknown',
    txId:null,
    fee:null
};


function getUTXOs(fromAddress) {
    return new Promise((resolve, reject) => {
       
        request.get('https://insight.litecore.io/api/addr/' + fromAddress + '/utxo').then(body=>{
            resolve(body.data)
        }).catch(err=>{
            reject(err);
        })
    })
}
function getBalance(fromAddress) {
    return new Promise((resolve, reject) => {
        
        request.get('https://insight.litecore.io/api/addr/' + fromAddress).then(body=>{
            resolve(body.data)
        }).catch(err=>{
            reject(err);
        })
    })
}

//manually hit an insight api to broadcast your tx
function broadcastTX(rawtx) {
    return new Promise((resolve, reject) => {
        request.post('https://api.blockcypher.com/v1/ltc/main/txs/push',{tx:rawtx.toString()}).then(body=>{
            resolve(body.data.tx.hash)
        }).catch(err=>{
            reject('LTC Broadcasting failure',err);
        })
    })
}
exports.send = (fromAddress,pKey,toAddress,sendAmountInSatoshi,withFee=0) => {


    return new Promise((resolve,reject)=>{
        getUTXOs(fromAddress)
            .then((utxos) => {
                let fee = 0;
                if(sendAmountInSatoshi<1000000){
                    fee = 1300;
                }else if(sendAmountInSatoshi<10000000){
                    fee = 5000;
                }else{
                    fee = 10000;
                }

                if(withFee==1){
                    sendAmountInSatoshi = parseInt(sendAmountInSatoshi-fee);
                }
                response.fee = (fee*0.00000001).toFixed(8);

                let tx = new litecore.Transaction() //use litecore-lib to create a transaction
                    .from(utxos)
                    .to(toAddress, parseInt(sendAmountInSatoshi)) //note: you are sending all your balance AKA sweeping
                    .fee(parseInt(fee))
                    .change(fromAddress)
                    .sign(pKey)
                    .serialize();

                return broadcastTX(tx) //broadcast the serialized tx
            },error =>{
                console.log(error);
                var response = {
                    'error' : 1,
                    'error_code' : 540,
                    'message' : 'UTXOS not found while sending ltc'
                };

                reject(response);
            })
            .then((result) => {
                console.log(result);
                let res = {
                    'error': 0,
                    'message': 'LTC has transferred successfully',
                    'txId': result,
                }
                resolve(res);

            })
            .catch((error) => {
                console.log(error);
                response.error = 1;
                response.error_code = 540;
                response.message = 'Broadcasting Failure at sending ltc';
                reject(response);
            });
    });

};