let EthTx = require('ethereumjs-tx');



class Ethtransfer {

    send(fromAddress,pKey,toAddress,sendAmount,withFee=0,network){
        console.log("withFee",withFee)
        console.log("withFee",withFee)
        return new Promise((resolve,reject)=>{
            let web3 = require('web3');

            if(network == 'testnet'){
                web3 = new web3(new web3.providers.HttpProvider("https://rinkeby.infura.io/v3/15851454d7644cff846b1b8701403647"));
            }else{
                web3 = new web3(new web3.providers.HttpProvider("https://mainnet.infura.io/v3/15851454d7644cff846b1b8701403647"));
            }

            if(pKey.length==66){
                pKey = pKey.substr(2, pKey.length);
            }

            let fromPkeyB =Buffer.from(pKey,'hex');

            //Get Nonce for sending amount

            web3.eth.getTransactionCount(fromAddress).then(function(nonce){
                var EthAmount = parseInt(web3.utils.toWei(`${sendAmount}`));

                web3.eth.getBalance(fromAddress,(err,balance)=>{

                    if (err) {
                        response.error = 1;
                        response.error_code = 540;
                        response.message = 'Something went wrong to get balance of sender(ETH)!';
                        reject(response);
                        return false;
                        // Handle errors...
                    }else{
                        //if balance is available
                        web3.eth.getGasPrice()
                            .then((gasPrice)=>{

                                const gasLimit = 21000;
                                let fee = gasLimit*gasPrice;

                                if(withFee==1){
                                    EthAmount = EthAmount-fee;
                                }

                                response.fee = web3.utils.fromWei(`${fee}`);

                                if(parseInt(balance)<EthAmount+fee || balance == 0){

                                    response.error = 1;
                                    response.error_code = 540;
                                    response.message = 'Insufficient balance of sender(ETH)!';
                                    reject(response);
                                    return false;
                                }else{
                                    let rawTx = {
                                        nonce: web3.utils.toHex(nonce),
                                        from:fromAddress,
                                        to: toAddress,
                                        value:web3.utils.toHex(EthAmount),
                                        gasLimit:web3.utils.toHex(gasLimit),
                                        gasPrice:web3.utils.toHex(gasPrice)
                                    };

                                    if(network=='testnet'){
                                        rawTx.chainId = web3.utils.toHex(4); //4=rinkeby 42=kovan 1=main
                                    }

                                    let tx = new EthTx(rawTx);

                                    tx.sign(fromPkeyB);

                                    const serializeTx = `0x${tx.serialize().toString('hex')}`;

                                    web3.eth.sendSignedTransaction(serializeTx,(err,res)=>{
                                        if(err){
                                            console.log(err);
                                            response.error = 1;
                                            response.error_code = 540;
                                            response.message = 'Private key does not match or network error at broadcasting ETH';
                                            reject(response);
                                            return false;
                                        }else{
                                            response.error = 0;
                                            response.message = 'ETH has transferred Successfully';
                                            response.txId = res;
                                            resolve(response);

                                        }
                                    });
                                }

                            }); //getGasPrice
                    }

                });//getBalance for checking availability
            }).catch(err=>{
                response.error = 1;
                response.error_code = 540;
                response.message = 'Nonce not found at sending ETH!';
                reject(response);
            });
        })

    }
}

module.exports = new Ethtransfer;