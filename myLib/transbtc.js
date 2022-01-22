const bitcoin = require("bitcoinjs-lib");
const axios = require("axios");
const BITCOIN_DIGITS = 8;
const BITCOIN_SAT_MULT = Math.pow(10, BITCOIN_DIGITS);
console.log("I AM HERE+==========",BITCOIN_SAT_MULT)
const BITCOIN_FEE = 500;

function getInputs(utxos) {
    
    return new Promise((resolve,reject) => {
        let inputs = [];
        let utxosCount = utxos.length;
        let count = 0;
        utxos.map(async utxo => {
            // console.log("HERE======",utxo)
            if (utxo.confirmations >= 1) {
                try{
                    let urlTxes = await axios.get("https://blockchain.info/rawtx/" + utxo.tx_hash_big_endian + "?cors=true&format=hex");
                    
                    urlTxes = urlTxes.data
                    
                    // console.log("urlTxes",urlTxes)
                    
                    inputs.push({
                        hash: utxo.tx_hash_big_endian,
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
    console.log("AMOUNT",amount)
    return new Promise((resolve, reject) => {
        let amtSatoshi = Math.floor(amount * BITCOIN_SAT_MULT);
        console.log("shatonsi",amtSatoshi)
        let bitcoinNetwork = bitcoin.networks.bitcoin;
        axios.get("https://blockchain.info/unspent?cors=true&active=" + fromPublicKey).then(async resp => {
            try {
                console.log("resp.data.unspent_outputs",resp.data.unspent_outputs)
                const utxos = resp.data.unspent_outputs
                if(withFee==1){
                    amtSatoshi = amtSatoshi - BITCOIN_FEE
                }
                // const key = bitcoin.ECPair.fromWIF(privateKey,bitcoinNetwork)
                const key = bitcoin.ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'))
                let tx = new bitcoin.Psbt(bitcoinNetwork);
                let availableSat = 0;
                utxos.map(input => {
                    // console.log("INPUT===",input)
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


                console.log("tx_inputs",tx_inputs)


                tx_inputs.forEach(input => {
                    tx.addInput(input)
                });

                if (availableSat < amtSatoshi + BITCOIN_FEE) {
                    console.log("ERROR  I AM HERE")
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
                    console.log("MY ERROR",err)
                    return reject({
                        'error' : 1,
                        'error_code' : 540,
                        'message' : "Broadcasting Failure at sending BTC"
                    });
                    
                })
            } catch (err) {
                console.log("IDL ERROR",err)
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
            console.log("YOUR EROR",err)
            return reject({
                'error' : 1,
                'error_code' : 540,
                'message' : "Something went wrong to find UTXO BTC."
            });
        });
    })

}