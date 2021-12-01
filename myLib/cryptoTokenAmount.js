const request = require('axios');

const bchaddr = require('bchaddrjs');

let url;
let balance = {
    'balance': 0
};
let error = {
    'error_code': 545,
    'message': ''
};

function getBalanceErrorResponse(err = 'Something went wrong to get balance!', error_code = 545) {
    error = {
        'error_code': error_code,
        'message': err
    };
    return error;
}

exports.getBalance = (currency, address) => {
    return new Promise((resolve, reject) => {
        switch (currency) {

            case 'ETH':
                var web3 = require('web3');
                web3 = new web3(new web3.providers.HttpProvider("https://mainnet.infura.io/v3/15851454d7644cff846b1b8701403647"));
                web3.eth.getBalance(address, (err, res) => {

                    if (err) {
                        reject(getBalanceErrorResponse());
                    } else {
                        let currentEth = parseFloat(web3.utils.fromWei(res));
                        let balance = {
                            balance: currentEth,
                            unconfirmedBalance: 0,
                            total: currentEth
                        };
                        resolve(balance);
                    }

                });
                break;
            case 'BNB':
                var web3 = require('web3');
                web3 = new web3(new web3.providers.HttpProvider("https://speedy-nodes-nyc.moralis.io/b47f29685c7164e9748ceeb9/bsc/mainnet"));
                web3.eth.getBalance(address, (err, res) => {

                    if (err) {
                        reject(getBalanceErrorResponse());
                    } else {
                        let currentEth = parseFloat(web3.utils.fromWei(res));
                        let balance = {
                            balance: currentEth,
                            unconfirmedBalance: 0,
                            total: currentEth
                        };
                        resolve(balance);
                    }

                });
                break;
            case 'tETH':
                var web3 = require('web3');
                web3 = new web3(new web3.providers.HttpProvider("https://rinkeby.infura.io/v3/15851454d7644cff846b1b8701403647"));
                web3.eth.getBalance(address, (err, res) => {

                    if (err) {
                        reject(getBalanceErrorResponse());
                    } else {
                        let currentEth = parseFloat(web3.utils.fromWei(res));
                        let balance = {
                            balance: currentEth,
                            unconfirmedBalance: 0,
                            total: currentEth
                        };
                        resolve(balance);
                    }

                });
                break;
            case 'BTC':
                let btc_url = 'https://api.blockcypher.com/v1/btc/main/addrs/' + address + '/balance';
                request.get(btc_url).then(body => {
                    let res = body.data;
                    let balance = {
                        balance: (res.balance) * 0.00000001,
                        unconfirmedBalance: (res.unconfirmed_balance) * 0.00000001,
                        total: (res.balance + res.unconfirmed_balance) * 0.00000001
                    };
                    resolve(balance);
                }).catch(err => {
                    console.log(err);
                    reject(getBalanceErrorResponse());
                });

                break;
            case 'tBTC':

                let tbtc_url = 'https://api.blockcypher.com/v1/btc/test3/addrs/' + address + '/balance';
                request.get(tbtc_url).then(body => {
                    let res = JSON.parse(body);
                    let balance = {
                        balance: (res.balance) * 0.00000001,
                        unconfirmedBalance: (res.unconfirmed_balance) * 0.00000001,
                        total: (res.balance + res.unconfirmed_balance) * 0.00000001
                    };
                    resolve(balance);
                }).catch(err => {
                    console.log(err);
                    reject(getBalanceErrorResponse());
                });

                break;

            case 'BCH':

                const toLegacyAddress = bchaddr.toLegacyAddress;
                const toBitpayAddress = bchaddr.toBitpayAddress;
                const toCashAddress = bchaddr.toCashAddress;

                let adds = toCashAddress(address);
                let bchurl = 'https://api.fullstack.cash/v3/blockbook/balance/' + address;
                request.get(bchurl).then(body => {
                    let res = body.data;
                    let balance = {
                        balance: (parseInt(res.balance)) * 0.00000001,
                        unconfirmedBalance: (parseInt(res.unconfirmedBalance)) * 0.00000001,
                        total: (parseInt(res.balance) + parseInt(res.unconfirmedBalance)) * 0.00000001,
                    };
                    resolve(balance);
                }).catch(err => {
                    console.log(err);
                    reject(getBalanceErrorResponse());
                });


                break;

            case 'LTC':
                //var url = 'https://insight.litecore.io/api/addr/' + address;
                let ltc_url = 'https://api.blockcypher.com/v1/ltc/main/addrs/' + address + '?limit=2';
                request.get(ltc_url).then(body => {
                    let res = body.data;
                    let balance = {
                        balance: (res.balance) * 0.00000001,
                        unconfirmedBalance: (res.unconfirmed_balance) * 0.00000001,
                        total: res.final_balance * 0.00000001
                    };
                    resolve(balance);
                }).catch(err => {
                    console.log(err);
                    reject(getBalanceErrorResponse());
                });

                break;

            default:
                error.error_code = 545;
                error.message = 'Invalid currency ' + currency;
                reject(error);
        }
    });

};



