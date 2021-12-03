const request = require('axios');
const axios = require('axios')
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

exports.getTokenBalance = async (currency, trxHash) => {

    let flag = 0
    let loopOver = [1, 2, 3, 4]

    var web3 = require('web3');

    const promise1 = await axios.get(`https://api.blockcypher.com/v1/ltc/main/txs/${trxHash}?limit=1`)
        .then(res => {
            flag = 1
            let balance = {
                balance: (res.data.total) * 0.00000001,
                total: res.data.total * 0.00000001
            }
            return balance
        }).catch(er => {
            // console.log("ER", er)
            return null
        })

    const promise2 = await axios.get(`https://api.bscscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${trxHash}&apikey=XZY87BD71ZVJH47SS8348X3CJK3IXBWV9C`)
        .then(res => {

            const format = web3.utils.fromWei((res.data.result.value).toString()); // 29803630.997051883414242659
            console.log("format", (format));
            // flag = 1
            // let balance = {
            //     balance: (res.data.result.value) * 0.00000001,
            //     total: res.data.result.value * 0.00000001
            // }
            return format
        }).catch(er => {
            return null
        })

    const promise3 = await axios.get(`https://api.blockcypher.com/v1/btc/main/txs/${trxHash}?limit=1`)
        .then(res => {
            flag = 1
            let balance = {
                balance: (res.data.total) * 0.00000001,
                total: res.data.total * 0.00000001
            }
            return balance
        }).catch(er => {
            // console.log("ER", er)
            return null
        })

    const promise4 = await axios.get(`https://api.blockcypher.com/v1/eth/main/txs/${trxHash}?limit=1`)
        .then(res => {
            flag = 1
            let balance = {
                balance: (res.data.total) * 0.00000001,
                total: res.data.total * 0.00000001
            }
            return balance
        }).catch(er => {
            // console.log("ER", er)
            return null
        })

    Promise.all([promise1, promise2, promise3, promise4]).then((values) => {
        console.log("values",values)
        return values
    }).catch(er=>{
        return er
    })

    // await Promise.all(loopOver.map(async (i) =>
    //     checkTransDetails(i, currency, trxHash)
    // )).then(res => {
    //     console.log("HERE=====", flag)
    //     console.log("HERE+++++", res)
    // })

    // async function checkTransDetails(element) {
    //     console.log("ERE====", element)
    //     if (element == 1) {

    //         var web3 = require('web3');
    //         await axios.get(`https://api.blockcypher.com/v1/ltc/main/txs/${trxHash}?limit=1`)
    //             .then(res => {
    //                 flag = 1
    //                 let balance = {
    //                     balance: (res.data.total) * 0.00000001,
    //                     total: res.data.total * 0.00000001
    //                 }
    //                 console.log("balance", balance)
    //             }).catch(er => {
    //                 // console.log("ER", er)
    //                 console.log("FUCk==================")
    //                 return { "asd": 123 }
    //             })
    //     }
    //     else if (element == 2) {

    //         var web3 = require('web3');
    //         await axios.get(`https://api.blockcypher.com/v1/btc/main/txs/${trxHash}?limit=1`)
    //             .then(res => {
    //                 flag = 1
    //                 let balance = {
    //                     balance: (res.data.total) * 0.00000001,
    //                     total: res.data.total * 0.00000001
    //                 }
    //                 console.log("balance", balance)
    //             }).catch(er => {
    //                 // console.log("ER", er)
    //             })
    //     }
    //     else if (element == 3) {

    //         var web3 = require('web3')
    //         await axios.get(`https://api.blockcypher.com/v1/eth/main/txs/${trxHash}?limit=1`)
    //             .then(res => {
    //                 flag = 1
    //                 let balance = {
    //                     balance: (res.data.total) * 0.00000001,
    //                     total: res.data.total * 0.00000001
    //                 }
    //                 console.log("balance", balance)
    //             }).catch(er => {
    //                 // console.log("ER", er)
    //             })
    //     }
    //     else if (element == 4) {

    //         var web3 = require('web3');
    //         await axios.get(`https://api.bscscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${trxHash}&apikey=XZY87BD71ZVJH47SS8348X3CJK3IXBWV9C`)
    //             .then(res => {

    //                 const format = web3.utils.fromWei((res.data.result.value).toString()); // 29803630.997051883414242659
    //                 console.log("format", (format));
    //                 // flag = 1
    //                 // let balance = {
    //                 //     balance: (res.data.result.value) * 0.00000001,
    //                 //     total: res.data.result.value * 0.00000001
    //                 // }
    //                 console.log("balance", balance)
    //             }).catch(er => {
    //                 console.log("ER", er)
    //             })
    //     }

    //     // web3.eth.getBalance(address, (err, res) => {

    //     //     if (err) {
    //     //         reject(getBalanceErrorResponse());
    //     //     } else {
    //     //         let currentEth = parseFloat(web3.utils.fromWei(res));
    //     //         let balance = {
    //     //             balance: currentEth,
    //     //             unconfirmedBalance: 0,
    //     //             total: currentEth
    //     //         };
    //     //         resolve(balance);
    //     //     }

    //     // });

    // }

    // async function checkTransDetails(element) {
    //     console.log("ERE====", element)
    //     if (element == 1) {

    //         var web3 = require('web3');
    //         await axios.get(`https://api.blockcypher.com/v1/ltc/main/txs/${trxHash}?limit=1`)
    //             .then(res => {
    //                 flag = 1
    //                 let balance = {
    //                     balance: (res.data.total) * 0.00000001,
    //                     total: res.data.total * 0.00000001
    //                 }
    //                 console.log("balance", balance)
    //             }).catch(er => {
    //                 // console.log("ER", er)
    //                 console.log("FUCk==================")
    //                 return {"asd":123}
    //             })
    //     }
    //     else if (element == 2) {

    //         var web3 = require('web3');
    //         await axios.get(`https://api.blockcypher.com/v1/btc/main/txs/${trxHash}?limit=1`)
    //             .then(res => {
    //                 flag = 1
    //                 let balance = {
    //                     balance: (res.data.total) * 0.00000001,
    //                     total: res.data.total * 0.00000001
    //                 }
    //                 console.log("balance", balance)
    //             }).catch(er => {
    //                 // console.log("ER", er)
    //             })
    //     }
    //     else if (element == 3) {

    //         var web3 = require('web3')
    //         await axios.get(`https://api.blockcypher.com/v1/eth/main/txs/${trxHash}?limit=1`)
    //             .then(res => {
    //                 flag = 1
    //                 let balance = {
    //                     balance: (res.data.total) * 0.00000001,
    //                     total: res.data.total * 0.00000001
    //                 }
    //                 console.log("balance", balance)
    //             }).catch(er => {
    //                 // console.log("ER", er)
    //             })
    //     }
    //     else if (element == 4) {

    //         var web3 = require('web3');
    //         await axios.get(`https://api.bscscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${trxHash}&apikey=XZY87BD71ZVJH47SS8348X3CJK3IXBWV9C`)                
    //             .then(res => {

    //                 const format = web3.utils.fromWei((res.data.result.value).toString()); // 29803630.997051883414242659
    //                 console.log("format", (format));
    //                 // flag = 1
    //                 // let balance = {
    //                 //     balance: (res.data.result.value) * 0.00000001,
    //                 //     total: res.data.result.value * 0.00000001
    //                 // }
    //                 console.log("balance", balance)
    //             }).catch(er => {
    //                 console.log("ER", er)
    //             })
    //     }

    //     // web3.eth.getBalance(address, (err, res) => {

    //     //     if (err) {
    //     //         reject(getBalanceErrorResponse());
    //     //     } else {
    //     //         let currentEth = parseFloat(web3.utils.fromWei(res));
    //     //         let balance = {
    //     //             balance: currentEth,
    //     //             unconfirmedBalance: 0,
    //     //             total: currentEth
    //     //         };
    //     //         resolve(balance);
    //     //     }

    //     // });

    // }





    // return new Promise((resolve, reject) => {


    //     var web3 = require('web3');
    //     web3 = new web3(new web3.providers.HttpProvider("https://speedy-nodes-nyc.moralis.io/b47f29685c7164e9748ceeb9/bsc/mainnet"));
    //     web3.eth.getBalance(address, (err, res) => {

    //         if (err) {
    //             reject(getBalanceErrorResponse());
    //         } else {
    //             let currentEth = parseFloat(web3.utils.fromWei(res));
    //             let balance = {
    //                 balance: currentEth,
    //                 unconfirmedBalance: 0,
    //                 total: currentEth
    //             };
    //             resolve(balance);
    //         }

    //     });
    //     var web3 = require('web3');
    //     web3 = new web3(new web3.providers.HttpProvider("https://rinkeby.infura.io/v3/15851454d7644cff846b1b8701403647"));
    //     web3.eth.getBalance(address, (err, res) => {

    //         if (err) {
    //             reject(getBalanceErrorResponse());
    //         } else {
    //             let currentEth = parseFloat(web3.utils.fromWei(res));
    //             let balance = {
    //                 balance: currentEth,
    //                 unconfirmedBalance: 0,
    //                 total: currentEth
    //             };
    //             resolve(balance);
    //         }

    //     });
    //     let btc_url = 'https://api.blockcypher.com/v1/btc/main/addrs/' + address + '/balance';
    //     request.get(btc_url).then(body => {
    //         let res = body.data;
    //         let balance = {
    //             balance: (res.balance) * 0.00000001,
    //             unconfirmedBalance: (res.unconfirmed_balance) * 0.00000001,
    //             total: (res.balance + res.unconfirmed_balance) * 0.00000001
    //         };
    //         resolve(balance);
    //     }).catch(err => {
    //         console.log(err);
    //         reject(getBalanceErrorResponse());
    //     });


    //     let tbtc_url = 'https://api.blockcypher.com/v1/btc/test3/addrs/' + address + '/balance';
    //     request.get(tbtc_url).then(body => {
    //         let res = JSON.parse(body);
    //         let balance = {
    //             balance: (res.balance) * 0.00000001,
    //             unconfirmedBalance: (res.unconfirmed_balance) * 0.00000001,
    //             total: (res.balance + res.unconfirmed_balance) * 0.00000001
    //         };
    //         resolve(balance);
    //     }).catch(err => {
    //         console.log(err);
    //         reject(getBalanceErrorResponse());
    //     });


    //     const toLegacyAddress = bchaddr.toLegacyAddress;
    //     const toBitpayAddress = bchaddr.toBitpayAddress;
    //     const toCashAddress = bchaddr.toCashAddress;

    //     let adds = toCashAddress(address);
    //     let bchurl = 'https://api.fullstack.cash/v3/blockbook/balance/' + address;
    //     request.get(bchurl).then(body => {
    //         let res = body.data;
    //         let balance = {
    //             balance: (parseInt(res.balance)) * 0.00000001,
    //             unconfirmedBalance: (parseInt(res.unconfirmedBalance)) * 0.00000001,
    //             total: (parseInt(res.balance) + parseInt(res.unconfirmedBalance)) * 0.00000001,
    //         };
    //         resolve(balance);
    //     }).catch(err => {
    //         console.log(err);
    //         reject(getBalanceErrorResponse());
    //     });


    //     //var url = 'https://insight.litecore.io/api/addr/' + address;
    //     let ltc_url = 'https://api.blockcypher.com/v1/ltc/main/addrs/' + address + '?limit=2';
    //     request.get(ltc_url).then(body => {
    //         let res = body.data;
    //         let balance = {
    //             balance: (res.balance) * 0.00000001,
    //             unconfirmedBalance: (res.unconfirmed_balance) * 0.00000001,
    //             total: res.final_balance * 0.00000001
    //         };
    //         resolve(balance);
    //     }).catch(err => {
    //         console.log(err);
    //         reject(getBalanceErrorResponse());
    //     });

    //     // break;

    //     //     default:
    //     // error.error_code = 545;
    //     // error.message = 'Invalid currency ' + currency;
    //     // reject(error);


    // });
}



