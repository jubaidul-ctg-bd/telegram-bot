const bitcoin = require("bitcoinjs-lib");
const axios = require("axios");
const BITCOIN_DIGITS = 8;
const BITCOIN_SAT_MULT = Math.pow(10, BITCOIN_DIGITS);
const BITCOIN_FEE = 3000;

function getInputs(utxos) {
    
    return new Promise((resolve,reject) => {
        let inputs = [];
        let utxosCount = utxos.length;
        let count = 0;
        utxos.forEach(async utxo => {
            if (utxo.confirmations >= 1) {
                try{
                    let urlTxes = await axios.get("https://blockchain.info/rawtx/" + utxo.tx_hash_big_endian + "?cors=true&format=hex");
                    console.log("urlTxes",urlTxes)
                    urlTxes = urlTxes.data
                    inputs.push({
                        hash: utxo.tx_hash,
                        index: utxo.tx_output_n,
                        nonWitnessUtxo: Buffer.from(urlTxes, 'hex')
                    });
                    count++
                    if (count === utxosCount) {
                        resolve(inputs)
                    }
                }catch(err){
                    console.log(err)
                    reject(err)
                }
                
            }else{
                return reject({
                    'error' : 1,
                    'error_code' : 540,
                    'message' : "Minimum Confirmed UTXOS NOT FOUND.Please again later"
                });
            }
        });
    })
}

exports.send = (fromPublicKey,privateKey, toPublicKey, amount,withFee=0) => {
    return new Promise((resolve, reject) => {
        let amtSatoshi = Math.floor(amount * BITCOIN_SAT_MULT);
        let bitcoinNetwork = bitcoin.networks.testnet;
        axios.get(`https://api.blockcypher.com/v1/btc/test3/addrs/${fromPublicKey}?unspentOnly=true`).then(async resp => {
            try {
                const utxos = resp.data.unspent_outputs
                if(withFee==1){
                    amtSatoshi = amtSatoshi - BITCOIN_FEE
                }
                // const key = bitcoin.ECPair.fromWIF(privateKey)
                const key = bitcoin.ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'))
                let tx = new bitcoin.Psbt(bitcoinNetwork);
                let availableSat = 0;
                utxos.forEach(input => {
                    availableSat += input.value;
                })
                if ((availableSat < amtSatoshi + BITCOIN_FEE) || amtSatoshi<0) {
                    reject({
                        'error' : 1,
                        'error_code' : 540,
                        'message' : "You do not have enough satoshis available to send this transaction."
                    });
                    return;
                }
                let tx_inputs = await getInputs(utxos);
                tx_inputs.forEach(input => {
                    tx.addInput(input)
                });

                if (availableSat < amtSatoshi + BITCOIN_FEE) {
                    
                    reject({
                        'error' : 1,
                        'error_code' : 540,
                        'message' : "You do not have enough satoshis available to send this transaction."
                    });
                    return;
                }
                tx.addOutput({
                    address: toPublicKey,
                    value: amtSatoshi
                })
                if((availableSat - amtSatoshi - BITCOIN_FEE)>0){
                    tx.addOutput({
                        address: fromPublicKey,
                        value: availableSat - (amtSatoshi + BITCOIN_FEE)
                    });
                }
                
                for (let i = 0; i < tx_inputs.length; i++) {
                    tx.signInput(i, key)
                }

                tx.validateSignaturesOfInput(0)
                
                tx.finalizeAllInputs()

                axios.post('https://api.blockcypher.com/v1/btc/main/txs/push', {tx: tx.extractTransaction().toHex() }).then(resp => {
                    return resolve({
                        'error': 0,
                        'message': 'BTC has transferred successfully',
                        'txId': resp.data.tx.hash
                    })
                }).catch(err => {
                    return reject({
                        'error' : 1,
                        'error_code' : 540,
                        'message' : "Broadcasting Failure at sending BTC"
                    });
                    
                })
            } catch (err) {
                if(err.error){
                    return reject(err);
                }else{
                    return reject({
                        'error' : 1,
                        'error_code' : 540,
                        'message' : "Error - (87)"
                    });
                }
                
            }
        }).catch(err => {
            return reject({
                'error' : 1,
                'error_code' : 540,
                'message' : "Something went wrong to find UTXO BTC."
            });
        });
    })

}