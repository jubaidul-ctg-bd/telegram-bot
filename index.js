const dotenv = require('dotenv')
const express = require('express')
const axios = require('axios')
const bodyParser = require('body-parser')
const BNBContractABI = require('./contactsABI/BNBabi.json')
const Fortmatic = require('fortmatic');
const { getBalance } = require('./myLib/cryptoBalance')
const bitcore = require('bitcore-lib');
const conn = require('./config/db_conn');
const litecore = require('litecore-lib');
const Web3 = require("web3");
const ganache = require('ganache-cli');
const e = require('express')
const app = express()
app.use(bodyParser.json())

// init env file
dotenv.config()

// const userRoute = require('./routes/auth/UserAuthRoute')  


// console.log("BNBContractABI",BNBContractABI)

const jsonAbi = BNBContractABI // JSON ABI of the token contract
const contractAddress = "0xB8c77482e45F1F44dE1745F52C74426C631bDD52"; // address of the token contract
const tokenAddress = "0xB8c77482e45F1F44dE1745F52C74426C631bDD52"; // address of which you want to get the token balance
// var web3 = new Web3(Web3.givenProvider || 'ws://some.local-or-remote.node:8546');
const provierUrl = process.env.PROVIER_URL || "http://127.0.0.1:3000"


// const BSCOptions = {
//     /* Smart Chain - Testnet RPC URL */
//       rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/', 
//       chainId: 97 // Smart Chain - Testnet chain id
//     }
// let web3 = new Web3(provierUrl);
// let web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/9e81cde3134f40019b152fafe6d2f265"));
// let web3 = new Web3(new Web3.providers.HttpProvider("https://data-seed-prebsc-1-s1.binance.org:8545"));
let web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/9e81cde3134f40019b152fafe6d2f265"));
// let web3 = new Web3(new Web3.providers.HttpProvider(BSCOptions));
// const web3 = new Fortmatic('YOUR_TEST_API_KEY', BSCOptions);

// const provider = ganache.provider();
// const web3 = new Web3(provider);


// console.log(web3)
let accountBalance
let error = null
const checkBalance = async (walletKey, type) => {

    if (type == 1) {
        web3.eth.getTransaction('0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8b§234')
        then(res => {
            console.log("asdasd", res)
        })
        web3.eth.getBalance("0xB8c77482e45F1F44dE1745F52C74426C631bDD52").then(res => {
            var balance = web3.utils.fromWei(res, 'ether')
            accountBalance = balance
            return balance
        }).catch(err => {
            error = err
            console.log("type1 error", err)
        })

    }
    else if (type == 2) {
        const contract = new web3.eth.Contract(jsonAbi, contractAddress);

        //get account balance in eth

        // web3.eth.getBalance("0xB8c77482e45F1F44dE1745F52C74426C631bDD52").then(res=>{
        //     console.log("ooo",res);
        //     var balance = web3.utils.fromWei(res, 'ether')
        //     console.log("bala",balance)
        // }).catch(err=>{
        //     console.log("err",err)
        // })




        // console.log('token',token)
        // await web3.eth.getBalance("0xB8c77482e45F1F44dE1745F52C74426C631bDD52").then(res=>{
        //     console.log("balance",res)
        // }).catch(err=>{
        //     console.log("err",err)
        // })

        // const balance = await token.methods.balanceOf(tokenAddress).call();
        // const balance = await token.balanceOf.call(tokenAddress)
        const result = await contract.methods.balanceOf(walletKey).call(); // 29803630997051883414242659

        console.log("result", result)

        const format = web3.utils.fromWei(result); // 29803630.997051883414242659

        console.log("format", (format));
        return format
        // const balance = web3.utils.fromWei(token, 'bnb')
        // balance = web3.utils.toDecimal(balance);
        // console.log("token", balance)
        // console.log("balance", balance)
    }
    else if (type == 3) {

        let mainWallet = "0xB8c77482e45F1F44dE1745F52C74426C631bDD52"

        const contract = new web3.eth.Contract(jsonAbi, contractAddress)

        const result = await contract.methods.balanceOf(mainWallet).call() // 29803630997051883414242659

        const format = web3.utils.fromWei(result) // 29803630.997051883414242659
        console.log("formate", format)
        return format

    }


}
// console.log("token",token)
// console.log("balance",balance)



const { TOKEN, SERVER_URL } = process.env
console.log("TOKEN", TOKEN)
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`
const URI = `/webhook/${TOKEN}`
const WEBHOOK_URL = SERVER_URL + URI

// getBalance("LTC","LcFFkbRUrr8j7TMi8oXUnfR4GPsgcXDepo")
// .then(res=>{
//     console.log("res",res);
// }).catch(err=>{
//     console.log("err",err)
// })


let btcPrice
let bnbPrice
let ltcPrice
let ethPrice
async function tokenPrice() {
    await axios.get(`https://betconix.com/api/v2/tickers`)
        .then(result => {
            // console.log("result===",result.)
            result.data.map(eleme => {
                if (eleme.ticker_id == 'BTC_USD') {
                    btcPrice = eleme.last_price
                }
                else if (eleme.ticker_id == 'LTC_USD') {
                    ltcPrice = eleme.last_price
                }
                else if (eleme.ticker_id == 'ETH_USD') {
                    ethPrice = eleme.last_price
                }
                else if (eleme.ticker_id == 'BNB_USD') {
                    bnbPrice = eleme.last_price
                    console.log(bnbPrice)
                }
            })
        }).catch(er => {
        })
}
tokenPrice()


async function getTokenBalance(trxHash, chatId) {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: "We are verifying your transaction details...\nplease wait"
    })
    let TransDetails
    let TokenPrice
    const promise1 = await axios.get(`https://api.blockcypher.com/v1/ltc/main/txs/${trxHash}?limit=1`)
        .then(async (res) => {
            // await axios.get(`https://api.coingecko.com/api/v3/coins/litecoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
            //     .then(result => {
            //         TokenPrice = result.data.market_data.current_price.usd
            //     }).catch(er=>{
            //         console.log("MAIN ERROR====111")
            //     })
            console.log("hhhhhhhhhhhhhhhhhhhh")
            let balance = {
                balance: (res.data["inputs"][0]["output_value"]) * 0.00000001,
                walletAddress: res.data["inputs"][0]["addresses"][0],
                tokenPrice: ltcPrice
            }
            return balance
        }).catch(er => {
            console.log("ER1")
            return null
        })

    const promise2 = await axios.get(`https://api-testnet.bscscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${trxHash}&apikey=XZY87BD71ZVJH47SS8348X3CJK3IXBWV9C`)
        .then(async (res) => {
            // await axios.get(`https://betconix.com/api/v2/tickers`)
            //     .then(result => {
            //         console.log("result",result.data)
            //         TokenPrice = result.data.market_data.current_price.usd
            //     }).catch(er=>{
            //         console.log("MAIN ERROR====")
            //     })
            console.log("ttttttt")
            if (res.data.result.value) {
                const format = web3.utils.fromWei((res.data.result.value).toString()); // 29803630.997051883414242659
                let balance = {
                    balance: format,
                    total: format,
                    walletAddress: res.data.result.from,
                    tokenPrice: bnbPrice
                }
                return balance
            }

        }).catch(er => {
            console.log("ER2")
            return null
        })

    const promise3 = await axios.get(`https://api.blockcypher.com/v1/btc/main/txs/${trxHash}?limit=1`)
        .then(async (res) => {
            // await axios.get(`https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
            //     .then(result => {
            //         TokenPrice = result.data.market_data.current_price.usd
            //     })
            console.log("sssssssss")
            let balance = {
                balance: (res.data["inputs"][0]["output_value"]) * 0.00000001,
                walletAddress: res.data["inputs"][0]["addresses"][0],
                tokenPrice: btcPrice
            }
            return balance
        }).catch(er => {
            console.log("ER3")
            return null
        })

    const promise4 = await axios.get(`https://api.blockcypher.com/v1/eth/main/txs/${trxHash}?limit=1`)
        .then(async (res) => {
            // await axios.get(`https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
            //     .then(result => {
            //         TokenPrice = result.data.market_data.current_price.usd
            //     })
            console.log("yyyyyyyyyy")
            let balance = {
                // balance: (res.data.total) * 0.00000001,
                // total: res.data.total * 0.00000001,
                // walletAddress: res.data["inputs"][0]["addresses"][0]
                balance: (res.data["inputs"][0]["output_value"]) * 0.00000001,
                walletAddress: res.data["inputs"][0]["addresses"][0],
                tokenPrice: ethPrice
            }
            return balance
        }).catch(er => {
            console.log("ER4")
            // console.log("ER", er)
            return null
        })

    await Promise.all([promise1, promise2, promise3, promise4]).
        then((values) => {
            TransDetails = values
            console.log("values", values)
            return values
        }).catch(er => {
            TransDetails = er
            return er
        })
    return TransDetails
}

async function checkWalletBalance(user_wallet_id, chatId, testnet) {
    const userPrivateWallet = `SELECT * FROM user_private_wallet WHERE user_wallet_id LIKE '${user_wallet_id}';`;
    const walletAddress = await new Promise((resolve, reject) => {
        conn.query(userPrivateWallet, (err, result) => {
            if (err) {
                console.log("eerr", err)
            }
            else {
                return resolve(result)
            }
        })
    })
    console.log("walletAddress", walletAddress)
    let TransDetails
    let TokenPrice
    if (testnet == 1) {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: "We are verifying your transaction details...\nplease wait"
        })


        const promise1 = await axios.get(`https://chain.so/api/v2/get_address_balance/LTCTEST/${walletAddress[1].walletAddress}`)
            .then(async (res) => {
                // await axios.get(`https://api.coingecko.com/api/v3/coins/litecoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
                //     .then(result => {
                //         TokenPrice = result.data.market_data.current_price.usd
                //     }).catch(er=>{
                //         console.log("MAIN ERROR====111")
                //     })
                console.log("res.data.confirmed_balance", res.data.confirmed_balance)
                let balance = {
                    // balance: (res.data.final_balance) * 0.00000001,
                    balance: res.data.confirmed_balance
                }
                console.log("hhhhhhhhhhhhhhhhhhhh", res.data, walletAddress[1], balance)
                return balance
            }).catch(er => {
                console.log("ER1")
                return null
            })

        const promise2 = await axios.get(`https://api-testnet.bscscan.com/api?module=account&action=balance&address=${walletAddress[2].walletAddress}&tag=latest&apikey=XZY87BD71ZVJH47SS8348X3CJK3IXBWV9C`)
            .then(async (res) => {
                // await axios.get(`https://betconix.com/api/v2/tickers`)
                //     .then(result => {
                //         console.log("result",result.data)
                //         TokenPrice = result.data.market_data.current_price.usd
                //     }).catch(er=>{
                //         console.log("MAIN ERROR====")
                //     })

                if (res.data.result) {
                    const format = web3.utils.fromWei((res.data.result).toString()); // 29803630.997051883414242659
                    let balance = {
                        balance: format,
                    }

                    return balance
                }
                console.log("jjjjjjjjjjjjjjjjj", res.data, walletAddress[2], balance)

            }).catch(er => {
                console.log("ER2")
                return null
            })

        const promise3 = await axios.get(`https://api.blockcypher.com/v1/btc/test3/addrs/${walletAddress[0].walletAddress}/balance`)
            .then(async (res) => {
                // await axios.get(`https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
                //     .then(result => {
                //         TokenPrice = result.data.market_data.current_price.usd
                //     })
                let balance = {
                    balance: (res.data.final_balance) * 0.00000001,
                }
                console.log("aaaaaaaaaaaaaaa", res.data, walletAddress[0], balance)
                return balance
            }).catch(er => {
                console.log("ER3")
                return null
            })

        const promise4 = await axios.get(`https://api-rinkeby.etherscan.io/api?module=account&action=balance&address=${walletAddress[2].walletAddress}&tag=latest&apikey=CDWRF4K5C8NC3YZK7K69MZDSRVXHTFE4WB`)
            .then(async (res) => {
                // await axios.get(`https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
                //     .then(result => {
                //         TokenPrice = result.data.market_data.current_price.usd
                //     })

                let balance = {
                    // balance: (res.data.total) * 0.00000001,
                    // total: res.data.total * 0.00000001,
                    // walletAddress: res.data["inputs"][0]["addresses"][0]
                    balance: web3.utils.fromWei((res.data.result).toString())
                }
                console.log("pppppppppppp", res.data, walletAddress[2], balance)
                return balance
            }).catch(er => {
                console.log("ER4")
                // console.log("ER", er)
                return null
            })
        await Promise.all([promise1, promise2, promise3, promise4]).
            then((values) => {
                TransDetails = values
                console.log("values", values)
                return values
            }).catch(er => {
                TransDetails = er
                return er
            })
    } else {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: "We are verifying your transaction details...\nplease wait"
        })
        let TransDetails
        let TokenPrice
        const promise1 = await axios.get(`https://api.blockcypher.com/v1/ltc/main/addrs/${walletAddress}/balance`)
            .then(async (res) => {
                // await axios.get(`https://api.coingecko.com/api/v3/coins/litecoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
                //     .then(result => {
                //         TokenPrice = result.data.market_data.current_price.usd
                //     }).catch(er=>{
                //         console.log("MAIN ERROR====111")
                //     })
                console.log("hhhhhhhhhhhhhhhhhhhh")
                let balance = {
                    balance: (res.data.final_balance) * 0.00000001,
                }
                return balance
            }).catch(er => {
                console.log("ER1")
                return null
            })
        const promise2 = await axios.get(`https://api.bscscan.com/api?module=account&action=balance&address=${walletAddress}&apikey=XZY87BD71ZVJH47SS8348X3CJK3IXBWV9C`)
            .then(async (res) => {
                // await axios.get(`https://betconix.com/api/v2/tickers`)
                //     .then(result => {
                //         console.log("result",result.data)
                //         TokenPrice = result.data.market_data.current_price.usd
                //     }).catch(er=>{
                //         console.log("MAIN ERROR====")
                //     })
                console.log("ttttttt")
                if (res.data.result.value) {
                    const format = web3.utils.fromWei((res.data.result).toString()); // 29803630.997051883414242659
                    let balance = {
                        balance: format,
                    }
                    return balance
                }

            }).catch(er => {
                console.log("ER2")
                return null
            })

        const promise3 = await axios.get(`https://api.blockcypher.com/v1/btc/main/addrs/${walletAddress}/balance`)
            .then(async (res) => {
                // await axios.get(`https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
                //     .then(result => {
                //         TokenPrice = result.data.market_data.current_price.usd
                //     })
                console.log("sssssssss")
                let balance = {
                    balance: (res.data.final_balance) * 0.00000001,
                }
                return balance
            }).catch(er => {
                console.log("ER3")
                return null
            })

        const promise4 = await axios.get(`https://api.blockcypher.com/v1/eth/main/addrs/${walletAddress}/balance`)
            .then(async (res) => {
                // await axios.get(`https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
                //     .then(result => {
                //         TokenPrice = result.data.market_data.current_price.usd
                //     })
                console.log("yyyyyyyyyy")
                let balance = {
                    // balance: (res.data.total) * 0.00000001,
                    // total: res.data.total * 0.00000001,
                    // walletAddress: res.data["inputs"][0]["addresses"][0]
                    balance: web3.utils.fromWei((res.data.final_balance).toString())
                }
                return balance
            }).catch(er => {
                console.log("ER4")
                // console.log("ER", er)
                return null
            })
        await Promise.all([promise1, promise2, promise3, promise4]).
            then((values) => {
                TransDetails = values
                console.log("values", values)
                return values
            }).catch(er => {
                TransDetails = er
                return er
            })
    }





    return TransDetails
}


async function sendOnlyone() {
    let toAddress = "0x964A6E4cBbbC5341d19F408ED90CD3fa35E1602D"
    let fromAddress = "0xAa4C101a8b42268d1F5117709b052C3bD273337d"
    const BNBContabiArrayractABI = require('./contactsABI//HuxhTokenABI.json')
    const abiArray = BNBContabiArrayractABI
    const contractAddress = "0xbae7588c722d279b93355dce53a4e88a08c2c381"
    var Tx = require('ethereumjs-tx').Transaction;
    var Web3 = require('web3');
    // var web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed.binance.org/'));
    var web3 = new Web3(new Web3.providers.HttpProvider("https://data-seed-prebsc-1-s1.binance.org:8545"));

    var amount = web3.utils.toHex(1);
    // var privateKey = Buffer.from("61b99f388f3b36384bc6a4727bcef1937d07de3817a392dea93cff0de27f50c9", 'hex');
    // // var contractAddress = '0xb899db682e6d6164d885ff67c1e676141deaaa40'; // ONLYONE address
    // var contract = new web3.eth.Contract(abiArray, contractAddress, {from: fromAddress});
    // let contractName = await contract.methods.name().call()
    // console.log("contractName",contractName)
    // // var transfer = contract.methods.transfer(toAddress, amount);
    // // console.log("ytas",transfer)
    // // var encodedABI = transfer.encodeABI();
    // var Common = require('ethereumjs-common').default;
    // var BSC_FORK = Common.forCustomChain(
    //     'mainnet',
    //     {
    //     name: 'Smart Chain - Testnet',
    //     networkId: 97,
    //     chainId: 97,
    //     url: 'https://data-seed-prebsc-1-s1.binance.org:8545/'
    //     },
    //     'istanbul',
    // );
    let values = await web3.eth.accounts.wallet.add({
        privateKey: '61b99f388f3b36384bc6a4727bcef1937d07de3817a392dea93cff0de27f50c9',
        address: '0xAa4C101a8b42268d1F5117709b052C3bD273337d'
    });
    // console.log("values==========",values)
    let account = await web3.eth.accounts.wallet
    // console.log("account",account)
    let myCount = account['0']
    // const accounts = await web3.eth.getAccounts();
    console.log("account", myCount)
    // console.log("accounts",accounts)
    var count = await web3.eth.getTransactionCount(fromAddress);
    // count += 1
    console.log("count", count)
    const gasLimit = 24000;
    let biteCode = await web3.eth.getCode(contractAddress)
    // console.log("biteCode",biteCode)
    let gasPrice = await web3.eth.getGasPrice()
    console.log("gasPrice", gasPrice)
    // var accounts = await web3.eth.accounts;
    // console.log("account",accounts[0])
    // let personal = await web3.eth.personal.unlockAccount(fromAddress, "61b99f388f3b36384bc6a4727bcef1937d07de3817a392dea93cff0de27f50c9", 600)
    // console.log("personal",personal)
    // .then(res=>{
    //     console.log("unclockAccont",res)
    // }).catch(err=>{
    //     console.log("Eerrr",err)
    // })

    var rawTransaction = {
        "from": fromAddress,
        "gasPrice": web3.utils.toHex(gasPrice),
        "gas": web3.utils.toHex(gasLimit),
        // "value":web3.utils.toHex(amount),
        // 'value': 0x0,
        // "data":contract.methods.transfer(toAddress, amount).encodeABI(),
        // "data":contract.methods.myMethod(biteCode).encodeABI(),
        // "data":encodedABI,
        "nonce": web3.utils.toHex(count)
    };

    const contract = new web3.eth.Contract(abiArray, contractAddress, { from: myCount.address, gas: 24000 });

    await contract.methods.balanceOf(fromAddress).call({

    }).
        then(res => {
            const format = web3.utils.fromWei(res); // 29803630.997051883414242659

            console.log("format", (format));
        }).
        catch(console.error);


    // await contract.methods.transfer(toAddress, amount).send()
    // .on('transactionHash', function(hash){
    //     console.log("hash",hash)
    // })
    // .on('confirmation', function(confirmationNumber, receipt){
    // })
    // .on('receipt', function(receipt){
    //     console.log("receipt",receipt)
    // }).
    // on('error', function(error, receipt) {
    //     console.log("errorreceipt",receipt) // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
    //     console.log("receipt",error) // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
    // })
    await contract.methods.transfer(toAddress, amount).send({
        from: fromAddress, value: amount * 1000000000000000000
    }

    )
        .on('transactionHash', function (hash) {
            console.log("hash", hash)
        })
        .on('confirmation', function (confirmationNumber, receipt) {
        })
        .on('receipt', function (receipt) {
            console.log("receipt", receipt)
        }).
        on('error', function (error, receipt) {
            console.log("errorreceipt", receipt) // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
            console.log("receipt", error) // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        })
    // .then(res=>{
    //     console.log("res",res)
    // }).catch(console.error);

    // var rawTransaction = {
    //     "from":fromAddress,
    //     "gasPrice":web3.utils.toHex(gasPrice),
    //     "gasLimit":web3.utils.toHex(gasLimit),
    //     "to":toAddress,
    //     // "value":web3.utils.toHex(amount),
    //     'value': 0x0,
    //     // "data":contract.methods.transfer(toAddress, amount).encodeABI(),
    //     // "data":contract.methods.myMethod(biteCode).encodeABI(),
    //     "data":encodedABI,
    //     "nonce":web3.utils.toHex(count)
    // };

    // var transaction = new Tx(rawTransaction, {'common':BSC_FORK});
    // transaction.sign(privateKey)

    // var result = await web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'));
    // console.log('result',result)
}

async function sendTestBnb(receiver) {
    let toAddress = receiver
    let fromAddress = "0xAa4C101a8b42268d1F5117709b052C3bD273337d"
    const BNBContabiArrayractABI = require('./contactsABI/HuxhTokenABI.json')
    const abiArray = BNBContabiArrayractABI
    const contractAddress = "0xbae7588c722d279b93355dce53a4e88a08c2c381"
    var Tx = require('ethereumjs-tx').Transaction;
    var Web3 = require('web3');
    // var web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed.binance.org/'));
    var web3 = new Web3(new Web3.providers.HttpProvider("https://data-seed-prebsc-1-s1.binance.org:8545"));

    var amount = .0001
    amount = parseInt(web3.utils.toWei(`${amount}`));
    console.log("asdasdasd", amount)
    var privateKey = Buffer.from("61b99f388f3b36384bc6a4727bcef1937d07de3817a392dea93cff0de27f50c9", 'hex');
    // var contractAddress = '0xb899db682e6d6164d885ff67c1e676141deaaa40'; // ONLYONE address
    var contract = new web3.eth.Contract(abiArray, contractAddress, { from: fromAddress });
    let contractName = await contract.methods.name().call()
    console.log("contractName", contractName)
    // var transfer = contract.methods.transfer(toAddress, amount);
    // console.log("ytas",transfer)
    // var encodedABI = transfer.encodeABI();
    var Common = require('ethereumjs-common').default;
    var BSC_FORK = Common.forCustomChain(
        'mainnet',
        {
            name: 'Smart Chain - Testnet',
            networkId: 97,
            chainId: 97,
            url: 'https://data-seed-prebsc-1-s1.binance.org:8545/'
        },
        'istanbul',
    );
    let values = await web3.eth.accounts.wallet.add({
        privateKey: '61b99f388f3b36384bc6a4727bcef1937d07de3817a392dea93cff0de27f50c9',
        address: '0xAa4C101a8b42268d1F5117709b052C3bD273337d'
    });
    // console.log("values==========",values)
    // let account = await web3.eth.accounts.wallet
    // // console.log("account",account)
    // let myCount = account['0']
    // // const accounts = await web3.eth.getAccounts();
    // console.log("account",myCount)
    // // console.log("accounts",accounts)
    var count = await web3.eth.getTransactionCount(fromAddress);
    // // count += 1
    // console.log("count",count)
    const gasLimit = 24000;
    // let biteCode = await web3.eth.getCode(contractAddress)
    // // console.log("biteCode",biteCode)
    let gasPrice = await web3.eth.getGasPrice()
    // console.log("gasPrice",gasPrice)
    // var accounts = await web3.eth.accounts;
    // console.log("account",accounts[0])
    // let personal = await web3.eth.personal.unlockAccount(fromAddress, "61b99f388f3b36384bc6a4727bcef1937d07de3817a392dea93cff0de27f50c9", 600)
    // console.log("personal",personal)
    // .then(res=>{
    //     console.log("unclockAccont",res)
    // }).catch(err=>{
    //     console.log("Eerrr",err)
    // })

    // var rawTransaction = {
    //     "from":fromAddress,
    //     "gasPrice":web3.utils.toHex(gasPrice),
    //     "gas":web3.utils.toHex(gasLimit),
    //     // "value":web3.utils.toHex(amount),
    //     // 'value': 0x0,
    //     "data":contract.methods.transfer(toAddress, amount).encodeABI(),
    //     // "data":contract.methods.myMethod(biteCode).encodeABI(),
    //     // "data":encodedABI,
    //     "nonce":web3.utils.toHex(count)
    // };

    // const contract = new web3.eth.Contract(abiArray, contractAddress, { from: myCount.address, gas: 24000});    

    // await contract.methods.balanceOf(fromAddress).call({

    // }).
    // then(res=>{
    //     const format = web3.utils.fromWei(res); // 29803630.997051883414242659

    //     console.log("format", (format));
    // }).
    // catch(console.error);


    // await contract.methods.transfer(toAddress, amount).send()
    // .on('transactionHash', function(hash){
    //     console.log("hash",hash)
    // })
    // .on('confirmation', function(confirmationNumber, receipt){
    // })
    // .on('receipt', function(receipt){
    //     console.log("receipt",receipt)
    // }).
    // on('error', function(error, receipt) {
    //     console.log("errorreceipt",receipt) // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
    //     console.log("receipt",error) // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
    // })
    // await contract.methods.transfer(toAddress,amount).send({
    //     from: fromAddress,value: amount*1000000000000000000
    // }

    // )
    // .on('transactionHash', function(hash){
    //     console.log("hash",hash)
    // })
    // .on('confirmation', function(confirmationNumber, receipt){
    // })
    // .on('receipt', function(receipt){
    //     console.log("receipt",receipt)
    // }).
    // on('error', function(error, receipt) {
    //     console.log("errorreceipt",receipt) // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
    //     console.log("receipt",error) // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
    // })
    // .then(res=>{
    //     console.log("res",res)
    // }).catch(console.error);

    var rawTransaction = {
        "from": fromAddress,
        "gasPrice": web3.utils.toHex(gasPrice),
        "gasLimit": web3.utils.toHex(gasLimit),
        "to": toAddress,
        "value": web3.utils.toHex(amount),
        // 'value': 0x0,
        "data": contract.methods.transfer(toAddress, amount).encodeABI(),
        // "data":contract.methods.myMethod(biteCode).encodeABI(),
        // "data":encodedABI,
        "nonce": web3.utils.toHex(count)
    };

    var transaction = new Tx(rawTransaction, { 'common': BSC_FORK });
    transaction.sign(privateKey)

    var result = await web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'));
    console.log('result', result)
}

async function transferBnB() {

    let from = "0xAa4C101a8b42268d1F5117709b052C3bD273337d" //me
    let to = "0x964A6E4cBbbC5341d19F408ED90CD3fa35E1602D"
    // const bnbContract = await new web3.eth.Contract(jsonAbi, contractAddress)
    // console.log("boncContact",bnbContract)
    // const totalSupply = bnbContract.methods.totalSupply().call()
    // var stuffPrice = 1;
    // console.log("totalSupply",web3.utils.toWei(
    //     web3.utils.toBN(stuffPrice), // converts Number to BN, which is accepted by `toWei()`
    //     'ether'
    // ))
    // let totalSupply = await bnbContract.methods.totalSupply().call()
    // let contractName = await bnbContract.methods.name().call()
    // let contractSymbol = await bnbContract.methods.symbol().call()
    let gasPrice = await web3.eth.getGasPrice()
    // let biteCode = await web3.eth.getCode(contractAddress)
    // let estimatedGas = await web3.eth.estimateGas({
    //     to: "0xAa4C101a8b42268d1F5117709b052C3bD273337d",
    //     data: biteCode
    // })
    // console.log("asd", web3.utils.fromWei(totalSupply))
    // console.log("asd", contractName)
    // console.log("asd", contractSymbol)
    console.log("gasPrice", gasPrice)
    // console.log("gasPrice", web3.utils.toHex(gasPrice))
    // console.log("biteCode", biteCode)
    // console.log("estimatedGas", estimatedGas)
    const send = .00001
    let amount = parseInt(web3.utils.toWei(`${send}`));
    const nonce = await web3.eth.getTransactionCount(from)
    // // console.log("sendAmount", amount)
    // // console.log("nonce", nonce)

    // const Common = require('ethereumjs-common');
    const EthTx = require('ethereumjs-tx').Transaction
    const gasLimit = 21000;
    // let EthAmount = parseInt(web3.utils.toWei(`${amount}`));
    console.log("amount==============", amount)
    // console.log("EthAmount==============",EthAmount)
    // let fee = gasLimit*gasPrice;
    // amount = amount-fee;
    // EthAmount = parseInt(web3.utils.toWei(`${EthAmount}`));
    // console.log("EthAmount==============",amount)
    // if(pKey.length==66){
    //     pKey = pKey.substr(2, pKey.length);
    // }


    // let rawTx = {
    //     nonce: web3.utils.toHex(nonce),
    //     from: from,
    //     to: to,
    //     value: web3.utils.toHex(amount),
    //     gasLimit: web3.utils.toHex(gasLimit),
    //     gasPrice: web3.utils.toHex(gasPrice)
    // };

    // if (network == 'testnet') {
    //     rawTx.chainId = web3.utils.toHex(4); //4=rinkeby 42=kovan 1=main
    // }

    // let tx = new EthTx(rawTx);

    // tx.sign(fromPkeyB);

    // const serializeTx = `0x${tx.serialize().toString('hex')}`;

    // web3.eth.sendSignedTransaction(serializeTx, (err, res) => {
    //     if (err) {
    //         // console.log(err);
    //         // response.error = 1;
    //         // response.error_code = 540;
    //         // response.message = 'Private key does not match or network error at broadcasting ETH';
    //         // reject(response);
    //         // return false;
    //         console.log("HEERER",err)
    //     } else {
    //         // response.error = 0;
    //         // response.message = 'ETH has transferred Successfully';
    //         // response.txId = res;
    //         // resolve(response);
    //         console.log("COM",res)
    //     }
    // });




    // const common = Common.default.forCustomChain('mainnet', {
    //     name: 'bnb',
    //     networkId: 97,
    //     chainId: 97
    // }, 'petersburg');
    // const common = {
    //     baseChain: 'mainnet',
    //     hardfork: 'petersburg',
    //     customChain: {
    //         name: 'custom-chain',
    //         chainId: 97,
    //         networkId: 97
    //     }
    // }
    // const networkId = await web3.eth.net.getId();
    // console.log("networkId",networkId)
    // const myContract = new web3.eth.Contract(
    //     jsonAbi,
    //     jsonAbi.networks[networkId].address
    // );
    // console.log("===============",myContract)
    // const idk = myContract.methods.setData(1);
    // const data = idk.encodeABI();
    let rawTx = {
        'from': from,
        'to': to,
        'value': web3.utils.toHex(amount),
        // 'value':web3.utils.toWei("0.1", "ether"),
        // 'data': bnbContract.methods.setValue(123,'ABC').encodeABI(),
        // 'data': bnbContract.methods.transfer(contractAddress, amount).encodeABI(),
        'nonce': web3.utils.toHex(nonce),
        // 'to': to,
        // 'gas': web3.utils.toHex(gasPrice),
        'gasLimit': web3.utils.toHex(gasLimit),
        'gasPrice': web3.utils.toHex(gasPrice),
        // 'common': common
        // 'chainId' : web3.utils.toHex(97)
    }


    // let rawTx = {
    //     'from': from,
    //     'to': to,
    //     'value': web3.utils.toHex(1),
    //     // 'value':web3.utils.toWei("0.1", "ether"),
    //     // 'data': bnbContract.methods.setValue(123,'ABC').encodeABI(),
    //     // 'data': bnbContract.methods.transfer(contractAddress, amount).encodeABI(),
    //     // 'data': bnbContract.methods.transfer(contractAddress, amount).encodeABI(),
    //     'nonce': web3.utils.toHex(nonce),
    //     // 'to': to,
    //     'gas': web3.utils.toHex(21000),
    //     'gasPrice': web3.utils.toHex(web3.utils.toWei('50','gwei')),
    //     'common': common,
    //     'chainId': web3.utils.toHex(97)

    // }


    let fromPkeyB = Buffer.from("61b99f388f3b36384bc6a4727bcef1937d07de3817a392dea93cff0de27f50c9", 'hex');

    let Tx = new EthTx(rawTx, { chain: 'rinkeby' });
    // let Tx = new EthTx(rawTx);
    // console.log("Tx===============",Tx)
    Tx.sign(fromPkeyB);



    const serializeTx = `0x${Tx.serialize().toString('hex')}`;

    web3.eth.sendSignedTransaction(serializeTx, (err, res) => {
        if (err) {
            // console.log(err);
            // response.error = 1;
            // response.error_code = 540;
            // response.message = 'Private key does not match or network error at broadcasting ETH';
            // reject(response);
            // return false;
            console.log("HEERER", err)
        } else {
            // response.error = 0;
            // response.message = 'ETH has transferred Successfully';
            // response.txId = res;
            // resolve(response);
            console.log("COM", res)
        }
    });

    // const signed_tx = await web3.eth.accounts.signTransaction(tx, "61b99f388f3b36384bc6a4727bcef1937d07de3817a392dea93cff0de27f50c9")
    // console.log("signed_tx", signed_tx)
    // const tx_hash = await web3.eth.sendSignedTransaction(signed_tx.rawTransaction)
    // const main_hash = tx_hash.toString('hex')
    // console.log("tx_hash", tx_hash)

    // const receipt = await web3.eth.sendSignedTransaction(signed_tx.rawTransaction);
    // console.log(`Transaction hash: ${receipt.transactionHash}`);
    // console.log(`New data value: ${await bnbContract.methods.data().call()}`);


    // const token_tx = bnbContract.methods.transfer(to,
    // amount).buildTransaction({
    //     'chainId': 97,
    //     'gas':100000,
    //     'gasPrice': web3.utils.toWei('10','gwei'),
    //     'nonce':nonce

    // })
    // const sign_txn = web3.eth.account.signTransaction(token_tx, "61b99f388f3b36384bc6a4727bcef1937d07de3817a392dea93cff0de27f50c9")
    // const dk  = web3.eth.sendRawTransaction(sign_txn.rawTransaction)
    // console.log("DFFF",dk)
    // console.log(`Transaction has been sent to ${main_address}`)
    // console.log("totalSupply",web3.utils.fromWei(totalSupply,'ether'))
}

async function transferToken(receiverAddress) {
    let from = process.env.mainWallet
    let walletKey = process.env.mainWalletKey
    let to = receiverAddress

    const gasPrice = await web3.eth.getGasPrice()
    //amount to be sended
    const sendAmount = .00001
    let amount = parseInt(web3.utils.toWei(`${sendAmount}`));
    //count previous transaction number
    const nonce = await web3.eth.getTransactionCount(from)

    const gasLimit = 21000;
    //transactionObject
    let rawTx = {
        'from': from,
        'to': to,
        'value': web3.utils.toHex(amount),
        // 'value':web3.utils.toWei("0.1", "ether"),
        // 'data': bnbContract.methods.setValue(123,'ABC').encodeABI(),
        // 'data': bnbContract.methods.transfer(contractAddress, amount).encodeABI(),
        'nonce': web3.utils.toHex(nonce),
        // 'to': to,
        // 'gas': web3.utils.toHex(gasPrice),
        'gasLimit': web3.utils.toHex(gasLimit),
        'gasPrice': web3.utils.toHex(gasPrice),
        // 'common': common
        // 'chainId' : web3.utils.toHex(4)
    }


    let fromPkeyB = Buffer.from(walletKey, 'hex');

    let Tx = new EthTx(rawTx, { chain: 'rinkeby' });
    // console.log("Tx===============",Tx)
    Tx.sign(fromPkeyB)

    const serializeTx = `0x${Tx.serialize().toString('hex')}`;

    web3.eth.sendSignedTransaction(serializeTx, (err, res) => {
        if (err) {
            // console.log(err);
            // response.error = 1;
            // response.error_code = 540;
            // response.message = 'Private key does not match or network error at broadcasting ETH';
            // reject(response);
            // return false;
            console.log("HEERER", err)
        } else {
            // response.error = 0;
            // response.message = 'ETH has transferred Successfully';
            // response.txId = res;
            // resolve(response);
            console.log("COM", res)
        }
    });

}

async function testTransferBnB() {
    transferBnB()
}
//test BNB token send
// sendTestBnb("0x964A6E4cBbbC5341d19F408ED90CD3fa35E1602D")

// testTransferBnB()
// sendOnlyone()

async function sendXGXToken(walletAddress) {

    return await axios.post(`https://env-2610583.nl.realcloud.in/api/send_token`, {
        "tokenamount": "500",
        "toAddress": walletAddress,
        "fromAddress": "0x5F56A4C387105447168F472C74956E60426D5182",
        "privateKey": "973d6e70a834e3178c936a4e2fa3191aa7510fdfafc098b2e82fdba3d8f90f89"
    })
        .then(async (res) => {
            if (res.data.error == false) {
                return true
            }
        }).catch(er => {
            console.log("ER1", er)
            return null
        })
}


async function asd() {
    // await axios.get(`https://api.bscscan.com/api?module=account&action=balance&address=0x70F657164e5b75689b64B7fd1fA275F334f28e18&apikey=XZY87BD71ZVJH47SS8348X3CJK3IXBWV9C`)
    //     .then(async (res) => {
    //         console.log("res", res.data)
    //         const format = web3.utils.fromWei((res.data.result).toString()); // 29803630.997051883414242659
    //         const balance = res.data.result * 0.00000001 // 29803630.997051883414242659
    //         console.log("format", format)
    //         console.log("format", balance)
    //         // // await axios.get(`https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
    //         // //     .then(result => {
    //         // //         TokenPrice = result.data.market_data.current_price.usd
    //         // //     })
    //         // console.log("sssssssss")
    //         // let balance = {
    //         //     balance: (res.data["inputs"][0]["output_value"]) * 0.00000001,
    //         //     walletAddress: res.data["inputs"][0]["addresses"][0],
    //         //     tokenPrice: btcPrice
    //         // }
    //         // return balance
    //     }).catch(er => {
    //         console.log("ER3")
    //         return null
    //     })

}

async function createUserWallet(walletId, amount, walletAddress, telegramId) {
    let account = await web3.eth.accounts.create()
    let accountPublicAddress

    const selectUserWallet = `SELECT id FROM user_wallet WHERE walletAddress LIKE '${walletAddress}';`;
    let userWalletQuery = "INSERT INTO user_wallet (id, walletAddress,privateKey,wallet_id,amount) VALUES (?);";
    let userWalletData = [null, account.address, account.privateKey, walletId, amount];
    accountPublicAddress = account.address
    let pKey
    let registereDuserQuery = "INSERT INTO register_user (id, user_wallet_id,user_id,token,nft,watch,miningPc,swapToken) VALUES (?);";
    //inserting new wallet
    await new Promise((resolve, reject) => {
        conn.query(userWalletQuery, [userWalletData], async (err, result, fields) => {
            if (err) {
                console.log("err 2", err)
                return reject(err)
            }
            else {
                // console.log("done 2", result)
                // console.log("done 2", result.insertId)

                let registeredUserData = [null, result.insertId, telegramId, 1, 1, 1, 1, 1];
                resolve(await new Promise((resolve, reject) => {
                    conn.query(registereDuserQuery, [registeredUserData], (err, result) => {
                        console.log("result===============", result)
                        pKey = result.insertId
                        if (err) {
                            console.log("err 3", err)
                            return reject(err)
                        }
                        else {
                            resolve(result)
                        }
                    })
                }))
            }
        })
    })
    let retunObj = {
        accountPublicAddress: accountPublicAddress,
        register_user_id: pKey
    }
    return retunObj
}

async function getUserWalletDetails(user_wallet_id) {
    let userWalletDetails = `SELECT * FROM user_wallet WHERE id =${user_wallet_id};`;
    let details = await new Promise((resolve, reject) => {
        conn.query(userWalletDetails, (err, result) => {
            if (err) {
                console.log("eerr", err)
            }
            else {
                return resolve(result)
            }
        })
    })
    return details

}

// asd()
let customMessage
async function storeWalletAddress(walletAddress, otp) {
    const isExist = `SELECT id FROM wallet_info WHERE walletAddress LIKE '${walletAddress}';`;
    let insertWalletQuery = "INSERT INTO wallet_info (id, walletAddress,otp) VALUES (?);";
    let paymentData = [null, walletAddress, otp];
    let id
    //inserting new wallet
    await new Promise((resolve, reject) => {
        conn.query(insertWalletQuery, [paymentData], async (err, result, fields) => {
            if (err) {
                console.log("err 2", err)
                return reject(err)
            }
            else {
                // console.log("done 2", result)
                return resolve(await new Promise((resolve, reject) => {
                    conn.query(isExist, (err, result) => {
                        if (err) {
                            console.log("err 3", err)
                            return reject(err)
                        }
                        else {
                            console.log("result==", result)
                            id = result
                            return resolve(result)
                        }
                    })
                }))
            }
        })
    })
    return id
}

// async function storeWalletAddress(walletAddress) {
//     const isExist = `SELECT id FROM wallet_info WHERE walletAddress LIKE '${walletAddress}';`;

//     return new Promise((resolve, reject) => {
//         conn.query(isExist, (err, result) => {
//             if (err) {
//                 return reject(err)
//             }
//             else {
//                 console.log(result)
//                 return resolve(customMessage)
//             }
//         })
//     })
// }
async function customTokenBalanceChecker() {
    const CustomTokenABI = require('./contactsABI/HuxhTokenABI.json')
    const abiArray = CustomTokenABI
    let fromAddress = "0x9ebabff1ba2131b0df15d6ab4f2a75251d5b28e3"
    const contractAddress = "0xbae7588c722d279b93355dce53a4e88a08c2c381"
    var Web3 = require('web3');
    // var web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed.binance.org/'));
    var web3 = new Web3(new Web3.providers.HttpProvider("https://data-seed-prebsc-1-s1.binance.org:8545"));
    var contract = new web3.eth.Contract(abiArray, contractAddress, { from: fromAddress });
    let contractName = await contract.methods.name().call()
    console.log("contractName", contractName)
    contract.methods.balanceOf(fromAddress).call().then(function (bal) {
        const format = web3.utils.fromWei(bal);
        console.log("formtae", format)
    })
}
async function givenTokenBalance(walletAddress) {
    const CustomTokenABI = require('./contactsABI/HuxhTokenABI.json')
    const abiArray = CustomTokenABI
    let fromAddress = walletAddress
    const contractAddress = "0xbae7588c722d279b93355dce53a4e88a08c2c381"
    var Web3 = require('web3');
    // var web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed.binance.org/'));
    var web3 = new Web3(new Web3.providers.HttpProvider("https://data-seed-prebsc-1-s1.binance.org:8545"));
    var contract = new web3.eth.Contract(abiArray, contractAddress, { from: fromAddress });
    let contractName = await contract.methods.name().call()
    console.log("contractName", contractName)
    await contract.methods.balanceOf(fromAddress).call().then(function (bal) {
        const balance = web3.utils.fromWei(bal);
        return balance
    }).catch(err => {
        return 0
    })
}
// checkGiveTokenBalance()
async function userDetails(user_id) {
    const userndUserRegisterQuery = `
                    SELECT user_wallet.*, register_user.*
                    FROM user_wallet 
                    JOIN register_user
                    ON user_wallet.id=register_user.user_wallet_id
                    WHERE user_id LIKE '${user_id}'`;

    return new Promise((resolve, reject) => {
        conn.query(userndUserRegisterQuery, (err, result) => {
            // console.log("result======", result.token)
            // console.log("result++++++", result[0].token)
            if (err) {
                console.log("ERROR==============asdasdasdasdas", err)
                return null
            }
            else if (result.length > 0) {
                if (result[0].token == 0) {
                    msg1 = "Token already claimed"
                } else {
                    msg1 = "Claim Token"
                }
                if (result.nft == 1) {
                    msg2 = "NFT already claimed"
                } else {
                    msg2 = "Claim NFT"
                }
                if (result.watch == 1) {
                    msg3 = "Watch Wallet already claimed"
                } else {
                    msg3 = "Claim Watch Wallet"
                }
                if (result.miningPc == 1) {
                    msg4 = "Mining PC already claimed"
                } else {
                    msg4 = "Claim Mining PC"
                }
                if (result.swapToken == 1) {
                    msg5 = "Swap Token already claimed"
                } else {
                    msg5 = "Claim Swap Token"
                }

                customMessage = "Available comamnd  \n" +
                    "/all - show all available commands \n" +
                    // "/walletAddress## - claim your giftBox Example This:/0x885943c5c8cf505a05b960e1d13052d0f033952e##\n"
                    `Token Status - ${msg1}\n` +
                    `NTF Status - ${msg2}\n` +
                    `Watch Wallet Status - ${msg3}\n` +
                    `Mining PC Status - ${msg4}\n` +
                    `SWAP TOKEN Status - ${msg5}\n`

            } else {
                customMessage = null
            }
            return resolve(customMessage)
        })
    })
    conn.query(userndUserRegisterQuery, async (err, result) => {
        if (err) {
            // return res.status(501).json({
            //     msg: "Number checking error",
            //     error: err.message
            // })
            console.log("erro", err)
            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                chat_id: chatId,
                text: `Server busy try again later...`
            })
        }
        else if (result.length > 0) {
            console.log("rest============", result)
            if (result.token == 1) {
                msg1 = "Token already claimed"
            } else {
                msg1 = "Claim Token"
            }
            if (result.nft == 1) {
                msg2 = "NFT already claimed"
            } else {
                msg2 = "Claim NFT"
            }
            if (result.watch == 1) {
                msg3 = "Watch Wallet already claimed"
            } else {
                msg3 = "Claim Watch Wallet"
            }
            if (result.miningPc == 1) {
                msg4 = "Mining PC already claimed"
            } else {
                msg4 = "Claim Mining PC"
            }
            if (result.swapToken == 1) {
                msg5 = "Swap Token already claimed"
            } else {
                msg5 = "Claim Swap Token"
            }

            customMessage = "Available comamnd  \n" +
                "/all - show all available commands \n" +
                // "/walletAddress## - claim your giftBox Example This:/0x885943c5c8cf505a05b960e1d13052d0f033952e##\n"
                `/claimtoken#walletAddress - ${msg1}\n` +
                `/claimnft#walletAddress - ${msg2}\n` +
                `/claimwatchwallet#walletAddress - ${msg3}\n` +
                `/claimminingpc#walletAddress - ${msg4}\n` +
                `/claimswaptoken#walletAddress - ${msg5}\n` +
                `/giftboxstatus - see your gift-box information \n`
            console.log("customMessage", customMessage)
            return customMessage
        }
    })
    console.log("RETURING.................", customMessage)
    return customMessage
}
//check user group validity
async function checkGroupAccess(userId) {
    console.log("userId", userId)
    const registerUserGroupQuery = `
    SELECT group_info.*, register_user.*
    FROM group_info 
    JOIN register_user
    ON group_info.register_user_id= register_user.id
    WHERE register_user.user_id LIKE '${userId}'`;
    let details = await new Promise((resolve, reject) => {
        conn.query(registerUserGroupQuery, (err, result) => {
            if (err) {
                console.log("eerr", err)
            }
            else {
                return resolve(result)
            }
        })
    })
    return details

}

// checkGroupAccess("414503684")
// //Corn Job Script  
// var CronJob = require('cron').CronJob;
// const { isValid } = require('litecore-lib/lib/address')

// var job = new CronJob('*/30 * * * * *', async function () {
//     //console.log('You will see this message every second');
//     //   await dailyTask.followUpNotification()
//     console.log("HERE====")
//     groupCheck()
// }, null, true, 'Asia/Dhaka')
// // job.start()

async function groupCheck() {
    const groupQuery = `SELECT * FROM group_info;`;
    let groupId
    let details = await new Promise((resolve, reject) => {
        conn.query(groupQuery, (err, result) => {
            if (err) {
                console.log("eerr", err)
            }
            else {
                return resolve(result)
            }
        })
    })
    console.log("details", details)
    if (details.length > 0) {
        groupId = details[0].groupId

        console.log("asdasdasdads", groupId)
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: groupId,
            text: "This wallet address is already registered"
        }).catch(err => {
            console.log("error========", err)
        })
    }

}

const init = async () => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`).then(
        res => {
            app.post(URI, async (req, res) => {
                console.log("req==============", req.body)
                let chatId
                let initialTest
                let temp
                let count
                let text
                let keyWord
                let flag = 0
                let userId
                let stageOneGroupUrl = "https://t.me/+bWXj3yu_x3UzNTJl"
                let firstGroupName = "XGX Gift-Box"
                let firstGroupId = "-1001522838826"
                let publicGroup = "XGX"
                let kickFlag = 0
                let userWalletAddress
                let keyBoard
                let chatTitle = 0
                // if(req.body.callback_query){
                //     console.log("H",req.body.callback_query)
                //     console.log("H",req.body)
                // }

                //requesting from firstStage group
                if (req.body && req.body.message && req.body.message.new_chat_title) {
                    console.log("I AM HERE")
                    chat_id = req.body.message.chat.id
                    text = "Group name has been changed"
                    chatTitle = true
                    // await axios.post(`${TELEGRAM_API}/sendMessage`, {
                    //     chat_id: req.body.callback_query.message.chat.id,
                    //     text: 'Welcome New Member'
                    // }).catch(er => {
                    //     console.log("ERRROR", er)
                    // })
                }
                else if (req.body && req.body.message && req.body.message.new_chat_member) {
                    console.log("I AM HERE")
                    chat_id = req.body.message.chat.id
                    text = "New user has entered to the group"
                    // await axios.post(`${TELEGRAM_API}/sendMessage`, {
                    //     chat_id: req.body.callback_query.message.chat.id,
                    //     text: 'Welcome New Member'
                    // }).catch(er => {
                    //     console.log("ERRROR", er)
                    // })
                }
                else if (req.body && req.body.message && req.body.message.left_chat_member) {
                    console.log("I AM THERE")
                    chat_id = req.body.message.chat.id
                    text = "Someone has left the group"
                    // await axios.post(`${TELEGRAM_API}/sendMessage`, {
                    //     chat_id: req.body.callback_query.message.chat.id,
                    //     text: 'Member Left Channel'
                    // }).catch(er => {
                    //     console.log("ERRROR", er)
                    // })
                }
                else if (req.body.callback_query && req.body.callback_query.message.chat.title == firstGroupName) {
                    // console.log("group mytest3", req.body)
                    await checkGroupAccess(req.body.callback_query.from.id).then(async (res) => {
                        if (res.length > 0) {
                            // console.log("res=========================", res)
                            // chatId = req.body.callback_query.from.id
                            chatId = req.body.callback_query.message.chat.id
                            text = req.body.callback_query.data

                            keyBoard = {
                                "inline_keyboard": [
                                    [
                                        {
                                            "text": "Claim Token",
                                            "callback_data": "Claim Token"
                                        }
                                    ],
                                    [
                                        {
                                            "text": "Claim NFT",
                                            "callback_data": "Claim NFT"
                                        }
                                    ],
                                    [
                                        {
                                            "text": "Claim Watch Wallet",
                                            "callback_data": "Claim Watch Wallet"
                                        }
                                    ],
                                    [
                                        {
                                            "text": "Claim Mining PC",
                                            "callback_data": "Claim Mining PC"
                                        }
                                    ],
                                    [
                                        {
                                            "text": "Claim Swap Token Distribution",
                                            "callback_data": "Claim Swap Token Distribution"
                                        }
                                    ],
                                    [
                                        {
                                            "text": "Check Wallet Token",
                                            "callback_data": "Check Wallet Token"
                                        }
                                    ],
                                ]
                            }



                        }
                        else {
                            console.log("BANNING UNKWNON GROUP MEMBER", req.body)
                            await axios.post(`${TELEGRAM_API}/banChatMember`, {
                                chat_id: req.body.callback_query.message.chat.id,
                                user_id: req.body.callback_query.from.id,
                                text: req.body.callback_query.message.text
                            }).catch(err => {
                                console.log("WTFFFF", err)
                            })
                            kickFlag = true

                        }
                    }).catch(async (er) => {
                        console.log("ANOTHER RERE", er.data)
                        // console.log("=====",req.body)
                        // console.log("++++++++",req.body.messsage.chat)
                        // await axios.post(`${TELEGRAM_API}/banChatMember`, {
                        //     chat_id: req.body.callback_query.message.chat.id,
                        //     user_id: req.body.callback_query.from.id,
                        //     text: req.body.callback_query.message.text
                        // })
                        // kickFlag = true
                    })

                }
                //requesting from primary group
                else if (req.body.callback_query && req.body.callback_query.message.chat.title == publicGroup) {
                    console.log("Call back public group", req.body.callback_query)
                    // chatId = req.body.callback_query.from.id
                    chatId = req.body.callback_query.message.chat.id
                    text = req.body.callback_query.data
                    initialTest =
                        "Available comamnd  \n" +
                        "/all - show all available commands \n" +
                        "/connect - connect to metaMask Wallet \n"
                    keyBoard = {
                        "inline_keyboard": [
                            [
                                {
                                    "text": "PROCESS TO PAYMENT",
                                    "callback_data": "PROCESS TO PAYMENT"
                                }
                            ],
                            [
                                {
                                    "text": "CONFIRM PAYMENT",
                                    "callback_data": "CONFIRM PAYMENT"
                                }
                            ],

                        ]
                    }
                }
                //dynamic message for claim status 
                else if (!req.body.my_chat_member && req.body.message.text && req.body.message.chat.title == firstGroupName) {
                    console.log("Initialized first group", req.body)


                    chatId = req.body.message.chat.id
                    userId = req.body.message.from.id
                    // userWalletAddress = (req.body.message.text).split("#")[1]

                    await userDetails(userId).then(async (res) => {
                        console.log("HERE /all commaned exceuted", res)
                        if (res) {
                            initialTest = res
                            text = req.body.message.text.toLowerCase()

                            temp = req.body.message.text

                            keyWord = (req.body.message.text).split("#")[0]

                            keyBoard = {
                                "inline_keyboard": [
                                    [
                                        {
                                            "text": "Claim Token",
                                            "callback_data": "Claim Token"
                                        }
                                    ],
                                    [
                                        {
                                            "text": "Claim NFT",
                                            "callback_data": "Claim NFT"
                                        }
                                    ],
                                    [
                                        {
                                            "text": "Claim Watch Wallet",
                                            "callback_data": "Claim Watch Wallet"
                                        }
                                    ],
                                    [
                                        {
                                            "text": "Claim Mining PC",
                                            "callback_data": "Claim Mining PC"
                                        }
                                    ],
                                    [
                                        {
                                            "text": "Claim Swap Token Distribution",
                                            "callback_data": "Claim Swap Token Distribution"
                                        }
                                    ],
                                    [
                                        {
                                            "text": "Check Wallet Token",
                                            "callback_data": "Check Wallet Token"
                                        }
                                    ],
                                ]
                            }

                            console.log("MYKEY==========", keyBoard)
                            //counting # in a string
                            // count = (temp.match(/#/g) || []).length;
                            // console.log(count);
                        } else {
                            // console.log("HERE FUCKING HERE")
                            await axios.post(`${TELEGRAM_API}/banChatMember`, {
                                chat_id: req.body.message.chat.id,
                                user_id: req.body.message.from.id,
                                text: req.body.message.text
                            }).catch(err => {
                                console.log("OMG", err)
                            })
                            kickFlag = true
                        }
                    }).catch(err => {
                        console.log("====================", err)

                        initialTest =
                            "Available comamnd  \n" +
                            "/all - show all available commands \n"
                        // "/walletAddress## - claim your giftBox Example This:/0x885943c5c8cf505a05b960e1d13052d0f033952e##\n"

                        console.log("initialTestTest=========", initialTest)
                        // console.log("REQ.BODY.message", req.body.message)
                        text = req.body.message.text.toLowerCase()

                        temp = req.body.message.text

                        keyWord = (req.body.message.text).split("#")[0]
                        console.log("keyWord firstStageGroup", keyWord)

                        keyBoard = {
                            "inline_keyboard": [
                                [
                                    {
                                        "text": "Claim Token",
                                        "callback_data": "Claim Token"
                                    }
                                ],
                                [
                                    {
                                        "text": "Claim NFT",
                                        "callback_data": "Claim NFT"
                                    }
                                ],
                                [
                                    {
                                        "text": "Claim Watch Wallet",
                                        "callback_data": "Claim Watch Wallet"
                                    }
                                ],
                                [
                                    {
                                        "text": "Claim Mining PC",
                                        "callback_data": "Claim Mining PC"
                                    }
                                ],
                                [
                                    {
                                        "text": "Claim Swap Token Distribution",
                                        "callback_data": "Claim Swap Token Distribution"
                                    }
                                ],
                                [
                                    {
                                        "text": "Check Wallet Token",
                                        "callback_data": "Check Wallet Token"
                                    }
                                ],
                            ]
                        }
                        //counting # in a string
                        // count = (temp.match(/#/g) || []).length;
                        // console.log(count);
                    })


                }
                // bot is interacting with single user or primary group
                else if (req.body.callback_query && req.body.message.chat.title == publicGroup) {
                    console.log("Initialized============= Here", req.body)
                    chatId = req.body.callback_query.message.chat.id
                    initialTest =
                        "Available comamnd  \n" +
                        "/all - show all available commands \n" +
                        "/connect - connect to metaMask Wallet \n"

                    // console.log("REQ.BODY.message", req.body.message)
                    text = req.body.message.text.toLowerCase()
                    temp = req.body.message.text

                    keyWord = ((req.body.message.text).split("#")[0]).toLowerCase()
                    console.log("keyWord", keyWord)
                    count = (temp.match(/#/g) || []).length;
                    console.log(count);

                    keyBoard = {
                        "inline_keyboard": [
                            [
                                {
                                    "text": "PROCESS TO PAYMENT",
                                    "callback_data": "PROCESS TO PAYMENT"
                                }
                            ],
                            [
                                {
                                    "text": "CONFIRM PAYMENT",
                                    "callback_data": "CONFIRM PAYMENT"
                                }
                            ],

                        ]
                    }

                }
                else if (!req.body.my_chat_member && req.body.message.chat.title == publicGroup) {
                    console.log("Initialized============= Here", req.body)
                    chatId = req.body.message.chat.id
                    initialTest =
                        "Available comamnd  \n" +
                        "/all - show all available commands \n" +
                        "/connect - connect to metaMask Wallet \n"

                    // console.log("REQ.BODY.message", req.body.message)
                    text = req.body.message.text.toLowerCase()
                    temp = req.body.message.text

                    keyWord = ((req.body.message.text).split("#")[0]).toLowerCase()
                    console.log("keyWord", keyWord)
                    count = (temp.match(/#/g) || []).length;
                    console.log(count);

                    keyBoard = {
                        "inline_keyboard": [
                            [
                                {
                                    "text": "PROCESS TO PAYMENT",
                                    "callback_data": "PROCESS TO PAYMENT"
                                }
                            ],
                            [
                                {
                                    "text": "CONFIRM PAYMENT",
                                    "callback_data": "CONFIRM PAYMENT"
                                }
                            ],

                        ]
                    }

                }
                else if (req.body.callback_query) {
                    text = req.body.callback_query.data
                    console.log("HERE=============asdasdasdas====", req.body)
                    console.log("HERE=============asdasdasdas====", req.body.callback_query.message)
                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: req.body.callback_query.message.chat.id,
                        text: 'Unknown group detecte...'
                    }).catch(er => {
                        console.log("ERRROR", er)
                    })
                }

                else if (!req.body.text && !req.body.my_chat_member) {

                    if (req.body.callback_query) {
                        await axios.post(`${TELEGRAM_API}/unbanChatMember`, {
                            chat_id: req.body.callback_query.message.chat.id,
                            user_id: req.body.callback_query.message.from.id,
                            text: req.body.callback_query.message.text
                        })
                    }

                    console.log("HERE TEXT CANT!!!!!!!!!!!!!!!", req.body)
                    req.body.message.text = "Available comamnd  \n" +
                        "/all - show all available commands \n" +
                        "/connect - connect to metaMask Wallet \n" +
                        "/payment#walletAddress - book for a payment process\n" +
                        "/otp#yourotpcode - confirm your transaction with the otp that we have sended you\n"
                }
                else if (!req.body.my_chat_member) {

                    console.log("HERE TEXT CANT", req.body)
                    req.body.my_chat_member.text = "Available comamnd  \n" +
                        "/all - show all available commands \n" +
                        "/connect - connect to metaMask Wallet \n" +
                        "/walletAddress# - check your wallet BNB balance Example 0x885943c5c8cf505a05b960e1d13052d0f033952e#\n" +
                        "/transactionhash## - check transaction status\n" +
                        "/walletAddress### - balance check example\n"
                    console.log("!!!!!!!!!!!!!!!", req.body)
                }
                if (chatTitle == true) {
                    const mtext = text
                    if (req.body.callback_query) {
                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: req.body.callback_query.message.chat.id,
                            text: mtext,
                            // reply_markup: JSON.stringify(keyBoard)
                        })
                    } else {
                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: req.body.message.chat.id,
                            text: mtext,
                            // reply_markup: JSON.stringify(keyBoard)
                        })
                    }

                }
                else if (kickFlag == true) {
                    const mtext = "Unknown user detected\nMember has been banned successfully"
                    if (req.body.callback_query) {
                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: req.body.callback_query.message.chat.id,
                            text: mtext,
                            // reply_markup: JSON.stringify(keyBoard)
                        })
                    } else {
                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: req.body.message.chat.id,
                            text: mtext,
                            // reply_markup: JSON.stringify(keyBoard)
                        })
                    }

                }
                else if (req.body.message && req.body.message.left_chat_member) {
                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: chat_id,
                        text: text
                    }).catch(er => {
                        console.log("ERRROR", er)
                    })
                }
                else if (req.body.message && req.body.message.new_chat_member) {
                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: chat_id,
                        text: text
                    }).catch(er => {
                        console.log("ERRROR", er)
                    })
                }

                else if (req.body.my_chat_member) {
                    console.log("==================", req.body)
                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: req.body.my_chat_member.chat.id,
                        text: `Hii`
                    })
                }
                else if (text == 'Claim Token') {
                    console.log("Claim Token CAlled")
                    let user_id = req.body.callback_query.from.id
                    console.log("req.body.message.from.id", user_id)
                    let walletAddress
                    let updateQuery = `UPDATE register_user SET token ="${0}" WHERE user_id = '${user_id}'`;
                    // let values = [req.body.message.from.id];
                    const tokenClaimDetails = `SELECT register_user.* , user_wallet.*
                    FROM register_user
                    JOIN user_wallet
                    ON register_user.user_wallet_id = user_wallet.id
                    WHERE register_user.user_id = '${user_id}' AND token = '${1}' ;`;
                    //check token claimed or not
                    conn.query(tokenClaimDetails, async (err, result) => {
                        if (err) {
                            // return res.status(501).json({
                            //     msg: "Number checking error",
                            //     error: err.message
                            // })
                            console.log("erro", err)
                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: `Server busy try again later...`
                            })
                        }
                        else if (result.length > 0) {
                            walletAddress = result[0].walletAddress
                            //update table walletKey status 
                            conn.query(updateQuery, async (err, result) => {
                                if (err) {
                                    // return res.status(501).json({
                                    //     msg: "Number checking error",
                                    //     error: err.message
                                    // })
                                    console.log("erro", err)
                                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                        chat_id: chatId,
                                        text: `Server busy try again later...`
                                    })
                                }
                                else {
                                    conn.query(updateQuery, async (err, result) => {
                                        if (err) {
                                            console.log("err-r", err)
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server busy try again later...`
                                            })
                                        }
                                    })
                                    //call token send function 
                                    // sendTestBnb(walletAddress)
                                    await sendXGXToken(walletAddress).then(async (res) => {
                                        if (res) {
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Token has been sended into your wallet`
                                            })
                                        } else {
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server busy try again later...`
                                            })
                                        }
                                    }).catch(async (er) => {
                                        console.log("er", er)
                                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            chat_id: chatId,
                                            text: `Server busy try again later...`
                                        })
                                    })

                                }
                            })

                        }
                        else {

                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: `This wallet has already claimed it's token`
                            })

                        }

                    })


                    const mtext = "Write the following available commands:\n/all - for all available commands"

                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: req.body.callback_query.message.chat.id,
                        text: mtext,
                        reply_markup: JSON.stringify(keyBoard)
                    })
                }
                else if (text == 'Claim NFT') {

                    let NTFMSG = "Wait for next round"

                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: req.body.callback_query.message.chat.id,
                        text: NTFMSG,
                    })

                    const mtext = "Write the following available commands:\n/all - for all available commands"

                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: req.body.callback_query.message.chat.id,
                        text: mtext,
                        reply_markup: JSON.stringify(keyBoard)
                    })
                }
                else if (text == 'Claim Watch Wallet') {

                    let NTFMSG = "Wait for next round"

                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: req.body.callback_query.message.chat.id,
                        text: NTFMSG,
                    })

                    const mtext = "Write the following available commands:\n/all - for all available commands"

                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: req.body.callback_query.message.chat.id,
                        text: mtext,
                        reply_markup: JSON.stringify(keyBoard)
                    })
                }
                else if (text == 'Claim Mining PC') {

                    let NTFMSG = "Wait for next round"




                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: req.body.callback_query.message.chat.id,
                        text: NTFMSG,
                    })

                    const mtext = "Write the following available commands:\n/all - for all available commands"

                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: req.body.callback_query.message.chat.id,
                        text: mtext,
                        reply_markup: JSON.stringify(keyBoard)
                    })
                }
                else if (text == 'Claim Swap Token Distribution') {

                    let NTFMSG = "Wait for next round"

                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: req.body.callback_query.message.chat.id,
                        text: NTFMSG,
                    })

                    const mtext = "Write the following available commands:\n/all - for all available commands"

                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: req.body.callback_query.message.chat.id,
                        text: mtext,
                        reply_markup: JSON.stringify(keyBoard)
                    })
                }
                else if (text == 'Check Wallet Token') {

                    let user_id = req.body.callback_query.from.id

                    let tokenBalance


                    const userndUserRegisterQuery = `SELECT register_user.* , user_wallet.*
                    FROM register_user
                    JOIN user_wallet
                    ON register_user.user_wallet_id = user_wallet.id
                    WHERE register_user.user_id = '${user_id}'`;

                    conn.query(userndUserRegisterQuery, async (err, result) => {
                        if (err) {
                            // return res.status(501).json({
                            //     msg: "Number checking error",
                            //     error: err.message
                            // })
                            console.log("erro", err)
                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: `Server busy try again later...`
                            })
                        }
                        else if (result.length > 0) {
                            console.log("result", result)
                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: req.body.callback_query.message.chat.id,
                                text: NTFMSG,
                            })
                            await givenTokenBalance(result[0].walletAddress)
                                .then(res => {
                                    tokenBalance = `Your wallet holds ${res} token`
                                }).catch(err => {
                                    console.log("err", err)
                                })

                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: req.body.callback_query.message.chat.id,
                                text: tokenBalance,
                            })
                            const mtext = "Write the following available commands:\n/all - for all available commands"

                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: req.body.callback_query.message.chat.id,
                                text: mtext,
                                reply_markup: JSON.stringify(keyBoard)
                            })
                        } else {
                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: `Server busy try again later...`
                            })
                        }
                    })


                }
                else if (text == 'PROCESS TO PAYMENT') {
                    let otp = Math.floor(1000 + Math.random() * 9000)
                    let user_wallet_id

                    //Generate eth address with private key
                    let account = await web3.eth.accounts.create()

                    //Generate lit coin address with private key
                    let privateKeyLTC = new litecore.PrivateKey('testnet');
                    // let privateKeyLTC = new litecore.PrivateKey();
                    let addressLTC = privateKeyLTC.toAddress();
                    //Generate Bit coin address with private key
                    let privateKeyWIF = bitcore.PrivateKey('testnet').toWIF();
                    // let privateKeyWIF = bitcore.PrivateKey().toWIF();
                    let privateKeyBTC = bitcore.PrivateKey.fromWIF(privateKeyWIF);
                    let addressBTC = privateKeyBTC.toAddress();

                    let userPrivateWallet = "INSERT INTO user_private_wallet (id, user_wallet_id, privateKey, walletAddress, walletType) VALUES (?);";

                    console.log("PROCESS TO PAYMENT")
                    let user_id = req.body.callback_query.from.id
                    console.log("req.body.message.from.id", user_id)

                    let updateQuery = `UPDATE register_user SET token ="${0}" WHERE user_id = '${user_id}'`;
                    // let values = [req.body.message.from.id];
                    const userWalletExist = `SELECT * FROM register_user WHERE user_id LIKE '${user_id}';`;
                    //create user wallet
                    let personalWalletQuery = "INSERT INTO user_wallet (id, walletAddress, privateKey, amount, otp) VALUES (?);";
                    let personalWalletData = [null, account.address, account.privateKey, 0, otp];


                    //register user query
                    let registereDuserQuery = "INSERT INTO register_user (id, user_wallet_id,user_id,token,nft,watch,miningPc,swapToken) VALUES (?);";
                    conn.query(userWalletExist, async (err, result) => {

                        if (err) {
                            console.log("error", err)
                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: "Server is busy try again..."
                            })
                        }
                        //user found
                        else if (result.length > 0) {
                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: `Your are already registered.\nPlease make the payment and Click on CONFIRM PAYMENT`
                            })
                        }
                        //did not found user then create userWallet
                        else {
                            conn.query(personalWalletQuery, [personalWalletData], async (err, result, fields) => {
                                if (err) {
                                    console.log("error", err)
                                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                        chat_id: chatId,
                                        text: "Server is busy try again..."
                                    })
                                }
                                //create register user details
                                else {
                                    user_wallet_id = result.insertId
                                    let registeredUserData = [null, user_wallet_id, req.body.callback_query.from.id, 1, 1, 1, 1, 1];
                                    conn.query(registereDuserQuery, [registeredUserData], async (err, result, fields) => {
                                        if (err) {
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "Server is busy try again..."
                                            })
                                        }
                                        else {

                                            let bitcoinWalletData = [null, user_wallet_id, privateKeyBTC, addressBTC, "BTC"];
                                            let litecoinWalletData = [null, user_wallet_id, privateKeyLTC, addressLTC, "LTC"];
                                            let ethWalletData = [null, user_wallet_id, account.privateKey, account.address, "ETH"];


                                            conn.query(userPrivateWallet, [bitcoinWalletData], async (err, result, fields) => {

                                            })
                                            conn.query(userPrivateWallet, [litecoinWalletData], async (err, result, fields) => {

                                            })
                                            conn.query(userPrivateWallet, [ethWalletData], async (err, result, fields) => {

                                            })


                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "Please checkout your inbox.We have provided you with all details",
                                                reply_markup: JSON.stringify(keyBoard)
                                            })

                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: user_id,
                                                text: `Your Verification code is ${otp}\nDon't share it with anyone.\n
                                                Bitcoin wallet address - ${addressBTC}\n
                                                Ethereum wallet address - ${account.address}\n
                                                Litecoin wallet address - ${addressLTC}\n
                                                Binance Coin wallet address - ${account.address}\n`
                                            }).catch(async (err) => {
                                                console.log("error", err)
                                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                    chat_id: chatId,
                                                    text: "Server is busy try again..."
                                                })
                                            })

                                        }
                                    })
                                }
                            })
                        }
                    })

                }
                else if (text == 'CONFIRM PAYMENT') {

                    let user_id = req.body.callback_query.from.id
                    let user_wallet_id
                    let wallet_id
                    let register_user_id
                    const userWalletExist = `SELECT register_user.*,user_wallet.*
                    FROM register_user
                    JOIN user_wallet
                    ON register_user.user_wallet_id=user_wallet.id
                    WHERE register_user.user_id = '${user_id}' AND user_wallet.success = ${0};`;

                    conn.query(userWalletExist, async (err, result) => {
                        // console.log("result======", result.token)
                        // console.log("result++++++", result[0].token)
                        if (err) {
                            console.log("ERROR==============asdasdasdasdas", err)
                            return null
                        }
                        else if (result.length > 0) {
                            console.log("HERE======CONFRIM PAYMENT", result)
                            user_wallet_id = result[0].user_wallet_id
                            register_user_id = result[0].id
                            await checkWalletBalance(result[0].user_wallet_id, chatId, 1)
                                .then(async (res) => {
                                    if (res[0].balance || res[1].balance || res[2].balance || res[3].balance) {
                                        let total = 0
                                        //ltc , bsc, btc , eth
                                        if (res[0].balance && Number(res[0].balance) > 0) {

                                            total += Number(res[0].balance) * ltcPrice
                                            console.log("=======", res[0].balance * ltcPrice)
                                            // if ((Number(res[0].balance * ltcPrice)) > 200) {
                                            //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            //         chat_id: chatId,
                                            //         text: `Your transaction is successful`
                                            //     })
                                            // } else {
                                            //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            //         chat_id: chatId,
                                            //         text: `Your transaction is less than required\nPlease check the amount you have sended`
                                            //     })
                                            // }

                                        } else if (res[1].balance && Number(res[1].balance) > 0) {
                                            total += Number(res[1].balance) * bnbPrice
                                            console.log("@@@@@@@@", res[1].balance * bnbPrice)
                                            // if ((Number(res[1] * bnbPrice)) > 200) {
                                            //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            //         chat_id: chatId,
                                            //         text: `Your transaction is successful`
                                            //     })
                                            // } else {
                                            //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            //         chat_id: chatId,
                                            //         text: `Your transaction is less than required\nPlease check the amount you have sended`
                                            //     })
                                            // }

                                        } else if (res[2].balance && Number(res[2].balance) > 0) {
                                            total += Number(res[2].balance) * btcPrice
                                            console.log("ZZZZZZ", res[2].balance * btcPrice)
                                            // if ((Number(res[2] * btcPrice)) > 200) {
                                            //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            //         chat_id: chatId,
                                            //         text: `Your transaction is successful`
                                            //     })
                                            // } else {
                                            //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            //         chat_id: chatId,
                                            //         text: `Your transaction is less than required\nPlease check the amount you have sended`
                                            //     })
                                            // }
                                        } else if (res[3].balance && Number(res[3].balance) > 0) {
                                            total += Number(res[3].balance) * ethPrice
                                            console.log("SSSSSS", (Number(res[3].balance * ethPrice)) > 200)

                                            // if ((Number(res[3].balance * ethPrice)) > 200) {
                                            //     createUserWallet(wallet_id, res[3].balance * ethPrice, walletAddress, req.body.message.from.id)
                                            //         .then(res => {
                                            //             console.log("resasdasd", res)
                                            //         }).catch(err => {
                                            //             console.log("errror", err)
                                            //         })

                                            //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            //         chat_id: chatId,
                                            //         text: `Your transaction is successful`
                                            //     })
                                        }
                                        if (total > 200) {
                                            console.log("TOTAL", total)
                                            // let userAccountAddress
                                            // createUserWallet(wallet_id, res[3].balance * ethPrice, walletAddress, req.body.message.from.id)
                                            //     .then(async (res) => {
                                            //         console.log("resasdasd", res)
                                            //         userAccountAddress = res.accountPublicAddress
                                            //         register_user_id = res.register_user_id
                                            //     }).catch(async (err) => {
                                            //         console.log("errror", err)
                                            //         await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            //             chat_id: chatId,
                                            //             text: `Server busy try again later...`
                                            //         })
                                            //     })
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Your transaction is successfull\nCheck your inbox.`
                                            })
                                            //update the sucess with corresponding otp 
                                            let updateWalletInfo = `UPDATE user_wallet SET success ="${1}" WHERE id = ${user_wallet_id}`;
                                            conn.query(updateWalletInfo, async (err, result, fields) => {
                                                if (err) {
                                                    console.log("ERROADasdasd==========")
                                                } else {
                                                    console.log("UPDATE CONFIRM")
                                                }
                                            })
                                            //create group_info with registered_user_id
                                            let groupInfoQuery = "INSERT INTO group_info (id, groupName,groupId,register_user_id) VALUES (?);";
                                            let groupInfoData = [null, firstGroupName, firstGroupId, register_user_id];
                                            conn.query(groupInfoQuery, [groupInfoData], async (err, result, fields) => {
                                                if (err) {
                                                    console.log("err 2", err)
                                                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                        chat_id: chatId,
                                                        text: `Server busy try again later...`
                                                    })
                                                } else {
                                                    await getUserWalletDetails(user_wallet_id)
                                                        .then(async (res) => {
                                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                chat_id: req.body.callback_query.from.id,
                                                                text: `Transaction was successfull\nYour wallet address is ${res[0].walletAddress}\nDon't share it with anyone.\nJoin here ${stageOneGroupUrl} and claim your token and see gift-box status`
                                                            })
                                                        }).catch(async (er) => {
                                                            console.log("CONFRIM PAYMENT ERROR ", er)
                                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                chat_id: chatId,
                                                                text: `Server busy try again later...`
                                                            })
                                                        })

                                                }
                                            })
                                        }
                                        else {
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Your transaction is less than required\nPlease check the amount you have sended`
                                            })
                                        }
                                    } else {
                                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            chat_id: chatId,
                                            text: `Server busy try again later...`
                                        })
                                    }
                                }).catch(async (err) => {
                                    console.log("err", err)
                                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                        chat_id: chatId,
                                        text: `Server busy try again later...`
                                    })
                                })
                        } else {
                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: "Your payment is done\nCheck we have inboxed you all details"
                            })
                        }
                    })

                }
                else if (keyWord == "/otp") {
                    let otp = (req.body.message.text).split("#")[1]
                    let wallet_id
                    let walletAddress
                    let register_user_id
                    console.log("otp", otp)
                    console.log("TESTING=========", req.body)

                    const findWalletQuery = `SELECT * FROM wallet_info WHERE otp LIKE '${otp}' AND success =${0};`;

                    conn.query(findWalletQuery, async (err, result) => {
                        console.log("asdadada", result)
                        if (err) {
                            console.log("erro", err)
                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: `Server busy try again later...`
                            })
                        }
                        else if (result.length > 0) {
                            const userWalletQuery = `SELECT * FROM user_private_wallet WHERE wallet_id LIKE '${result[0].id}';`;
                            conn.query(userWalletQuery, async (err, result) => {
                                if (err) {
                                    console.log("erro", err)
                                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                        chat_id: chatId,
                                        text: `Server busy try again later...`
                                    })
                                }
                                else if (result.length == 0) {
                                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                        chat_id: chatId,
                                        text: `Get register with wallet first`
                                    })
                                } else {
                                    wallet_id = result[0].id
                                    await checkWalletBalance(result, chatId, 1)
                                        .then(async (res) => {
                                            if (res[0].balance || res[1].balance || res[2].balance || res[3].balance) {
                                                let total = 0
                                                //ltc , bsc, btc , eth
                                                if (res[0].balance && Number(res[0].balance) > 0) {

                                                    total += Number(res[0].balance) * ltcPrice
                                                    console.log("=======", res[0].balance * ltcPrice)
                                                    // if ((Number(res[0].balance * ltcPrice)) > 200) {
                                                    //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                    //         chat_id: chatId,
                                                    //         text: `Your transaction is successful`
                                                    //     })
                                                    // } else {
                                                    //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                    //         chat_id: chatId,
                                                    //         text: `Your transaction is less than required\nPlease check the amount you have sended`
                                                    //     })
                                                    // }

                                                } else if (res[1].balance && Number(res[1].balance) > 0) {
                                                    total += Number(res[1].balance) * bnbPrice
                                                    console.log("@@@@@@@@", res[1].balance * bnbPrice)
                                                    // if ((Number(res[1] * bnbPrice)) > 200) {
                                                    //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                    //         chat_id: chatId,
                                                    //         text: `Your transaction is successful`
                                                    //     })
                                                    // } else {
                                                    //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                    //         chat_id: chatId,
                                                    //         text: `Your transaction is less than required\nPlease check the amount you have sended`
                                                    //     })
                                                    // }

                                                } else if (res[2].balance && Number(res[2].balance) > 0) {
                                                    total += Number(res[2].balance) * btcPrice
                                                    console.log("ZZZZZZ", res[2].balance * btcPrice)
                                                    // if ((Number(res[2] * btcPrice)) > 200) {
                                                    //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                    //         chat_id: chatId,
                                                    //         text: `Your transaction is successful`
                                                    //     })
                                                    // } else {
                                                    //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                    //         chat_id: chatId,
                                                    //         text: `Your transaction is less than required\nPlease check the amount you have sended`
                                                    //     })
                                                    // }
                                                } else if (res[3].balance && Number(res[3].balance) > 0) {
                                                    total += Number(res[3].balance) * ethPrice
                                                    console.log("SSSSSS", (Number(res[3].balance * ethPrice)) > 200)

                                                    // if ((Number(res[3].balance * ethPrice)) > 200) {
                                                    //     createUserWallet(wallet_id, res[3].balance * ethPrice, walletAddress, req.body.message.from.id)
                                                    //         .then(res => {
                                                    //             console.log("resasdasd", res)
                                                    //         }).catch(err => {
                                                    //             console.log("errror", err)
                                                    //         })

                                                    //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                    //         chat_id: chatId,
                                                    //         text: `Your transaction is successful`
                                                    //     })
                                                }
                                                if (total > -1) {
                                                    console.log("TOTAL", total)
                                                    let userAccountAddress
                                                    createUserWallet(wallet_id, res[3].balance * ethPrice, walletAddress, req.body.message.from.id)
                                                        .then(async (res) => {
                                                            console.log("resasdasd", res)
                                                            userAccountAddress = res.accountPublicAddress
                                                            register_user_id = res.register_user_id
                                                        }).catch(async (err) => {
                                                            console.log("errror", err)
                                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                chat_id: chatId,
                                                                text: `Server busy try again later...`
                                                            })
                                                        })
                                                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                        chat_id: chatId,
                                                        text: `Your transaction is successfull\nCheck your inbox.`
                                                    })
                                                    //update the sucess with corresponding otp 
                                                    let updateWalletInfo = `UPDATE wallet_info SET success ="${1}" WHERE otp = ${otp}`;
                                                    conn.query(updateWalletInfo, async (err, result, fields) => {

                                                    })
                                                    //create group_info with registered_user_id
                                                    let groupInfoQuery = "INSERT INTO group_info (id, groupName,groupId,register_user_id) VALUES (?);";
                                                    let groupInfoData = [null, firstGroupName, firstGroupId, register_user_id];
                                                    conn.query(groupInfoQuery, [groupInfoData], async (err, result, fields) => {
                                                        if (err) {
                                                            console.log("err 2", err)
                                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                chat_id: chatId,
                                                                text: `Server busy try again later...`
                                                            })
                                                        } else {
                                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                chat_id: req.body.message.from.id,
                                                                text: `Transaction was successfull\nYour wallet address is ${userAccountAddress}\nDon't share it with anyone.\nJoin here ${stageOneGroupUrl} and claim your token and see gift-box status`
                                                            })
                                                        }
                                                    })
                                                }
                                                else {
                                                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                        chat_id: chatId,
                                                        text: `Your transaction is less than required\nPlease check the amount you have sended`
                                                    })
                                                }
                                            } else {
                                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                    chat_id: chatId,
                                                    text: `Server busy try again later...`
                                                })
                                            }
                                        }).catch(async (err) => {
                                            console.log("err", err)
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server busy try again later...`
                                            })
                                        })


                                }
                            })
                        }
                        else {
                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: `Get register or if you are register we have inboxed you will details re-check again...`
                            })
                        }
                    })

                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: chatId,
                        text: initialTest,
                        reply_markup: JSON.stringify(keyBoard)
                    })
                }
                else if (text == "/test") {
                    console.log("TESTING=========", req.body)
                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: chatId,
                        text: initialTest,
                        reply_markup: JSON.stringify(keyBoard)
                    })
                }
                // else if (text == "/start") {
                //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                //         chat_id: chatId,
                //         text: initialTest
                //     })
                // }
                else if (req.body.message.text == "/walletAddress") {
                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: chatId,
                        text: "Write the command like /YourWalletAddress#"
                    })
                }
                // else if (text == "/all") {
                //     console.log("HERE============", keyBoard)
                //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                //         chat_id: chatId,
                //         text: initialTest,
                //         reply_markup: JSON.stringify(keyBoard)
                //     })
                // }
                else if (text == "/connect") {
                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: chatId,
                        text: "https://metamask.io/download.html"
                    })
                }
                //user asking for OTP against a walletAddress
                else if (keyWord == "/payment") {
                    console.log("keyWord", keyWord)
                    //Generate eth address with private key
                    let account = await web3.eth.accounts.create()

                    //Generate lit coin address with private key
                    let privateKeyLTC = new litecore.PrivateKey('testnet');
                    // let privateKeyLTC = new litecore.PrivateKey();
                    let addressLTC = privateKeyLTC.toAddress();
                    //Generate Bit coin address with private key
                    let privateKeyWIF = bitcore.PrivateKey('testnet').toWIF();
                    // let privateKeyWIF = bitcore.PrivateKey().toWIF();
                    let privateKeyBTC = bitcore.PrivateKey.fromWIF(privateKeyWIF);
                    let addressBTC = privateKeyBTC.toAddress();

                    // let wallet = {
                    //     'private': privateKey.toString(),
                    //     'public': addressBTC.toString()
                    // };
                    // console.log("wallet", wallet)
                    let walletAddress = (req.body.message.text).split("#")[1]
                    // if (walletAddress[0] != '0' && walletAddress[1] != 'x') {

                    // }
                    let otp = Math.floor(1000 + Math.random() * 9000)


                    let isExist = `SELECT id FROM wallet_info WHERE walletAddress LIKE '${walletAddress}';`;
                    let signupQry = "INSERT INTO wallet_info (id, walletAddress) VALUES (?);";
                    let btcWalletQuery = "INSERT INTO user_private_wallet (id, wallet_id, privateKey, walletAddress, walletType) VALUES (?);";
                    let paymentData = [null, walletAddress];
                    let wallet_id

                    conn.query(isExist, async (err, result) => {
                        if (err) {
                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: "Server is busy try again..."
                            })
                        }
                        else if (result.length > 0) {

                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: "This wallet address is already registered"
                            })
                        }
                        else {

                            await storeWalletAddress(walletAddress, otp).then(async (result) => {
                                console.log("res=================", result[0].id)
                                let bitcoinWalletData = [null, result[0].id, privateKeyBTC, addressBTC, "BTC"];
                                let litecoinWalletData = [null, result[0].id, privateKeyLTC, addressLTC, "LTC"];
                                let ethWalletData = [null, result[0].id, account.privateKey, account.address, "ETH"];


                                conn.query(btcWalletQuery, [bitcoinWalletData], async (err, result, fields) => {

                                })
                                conn.query(btcWalletQuery, [litecoinWalletData], async (err, result, fields) => {

                                })
                                conn.query(btcWalletQuery, [ethWalletData], async (err, result, fields) => {

                                })
                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: `Wait for while...\nCheck we have inbox you further details`
                                })

                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: req.body.message.from.id,
                                    text: `Your Verification code is ${otp}\nDon't share it with anyone.\n
                                    Bitcoin wallet address - ${addressBTC}\n
                                    Ethereum wallet address - ${account.address}\n
                                    Litecoin wallet address - ${addressLTC}\n
                                    Binance Coin wallet address - ${account.address}\n`
                                })
                            }).catch(async (er) => {
                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: "Server is busy try again..."
                                })
                            })

                        }
                    })



                }
                else if (keyWord == "/claimtoken") {
                    let walletAddress = (req.body.message.text).split("#")[1]
                    console.log("req.body.message.from.id", req.body.message.from.id)

                    let updateQuery = `UPDATE register_user SET token ="${0}" WHERE user_id = '${req.body.message.from.id}'`;
                    // let values = [req.body.message.from.id];
                    const tokenClaimDetails = `SELECT * FROM register_user WHERE user_id LIKE '${req.body.message.from.id}' AND token = '${1}' ;`;
                    //check token claimed or not
                    conn.query(tokenClaimDetails, async (err, result) => {
                        if (err) {
                            // return res.status(501).json({
                            //     msg: "Number checking error",
                            //     error: err.message
                            // })
                            console.log("erro", err)
                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: `Server busy try again later...`
                            })
                        }
                        else if (result.length > 0) {

                            //update table walletKey status 
                            conn.query(updateQuery, async (err, result) => {
                                if (err) {
                                    // return res.status(501).json({
                                    //     msg: "Number checking error",
                                    //     error: err.message
                                    // })
                                    console.log("erro", err)
                                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                        chat_id: chatId,
                                        text: `Server busy try again later...`
                                    })
                                }
                                else {
                                    conn.query(updateQuery, async (err, result) => {
                                        if (err) {
                                            console.log("err-r", err)
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server busy try again later...`
                                            })
                                        }
                                    })
                                    //call token send function 
                                    // sendTestBnb(walletAddress)
                                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                        chat_id: chatId,
                                        text: `Token has been sended into your wallet`
                                    })
                                }
                            })

                        }
                        else {

                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: `This wallet has already claimed it's token`
                            })

                        }

                    })
                }
                else if (keyWord == "/claimgiftbox") {
                    let walletAddress = (req.body.message.text).split("#")[1]


                    let updateQuery = `UPDATE transaction_info SET giftClaim ="${1}" WHERE walletAddress = ?`;
                    let values = [walletAddress];
                    const giftClaimDetails = `SELECT * FROM transaction_info WHERE walletAddress LIKE '${walletAddress}' AND giftClaim = '${0}';`;
                    //check token claimed or not
                    conn.query(giftClaimDetails, async (err, result) => {
                        if (err) {
                            // return res.status(501).json({
                            //     msg: "Number checking error",
                            //     error: err.message
                            // })
                            console.log("erro", err)
                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: `Server busy try again later...`
                            })
                        }
                        console.log("result...", result)
                        if (result.length > 0) {

                            //update table walletKey status 
                            conn.query(updateQuery, [values], async (err, result) => {
                                if (err) {
                                    // return res.status(501).json({
                                    //     msg: "Number checking error",
                                    //     error: err.message
                                    // })
                                    console.log("erro", err)
                                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                        chat_id: chatId,
                                        text: `Server busy try again later...`
                                    })
                                }
                                else {

                                    //call token send function 

                                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                        chat_id: chatId,
                                        text: `Gift-box has successfully claimed`
                                    })
                                }
                            })

                        }
                        else {

                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: `This wallet has already claimed it's gift-box`
                            })

                        }

                    })
                }
                else if (req.body.message.chat.title == firstGroupName) {
                    initialTest =
                        "Available comamnd  \n"

                    keyBoard = {
                        "inline_keyboard": [
                            [
                                {
                                    "text": "Claim Token",
                                    "callback_data": "Claim Token"
                                }
                            ],
                            [
                                {
                                    "text": "Claim NFT",
                                    "callback_data": "Claim NFT"
                                }
                            ],
                            [
                                {
                                    "text": "Claim Watch Wallet",
                                    "callback_data": "Claim Watch Wallet"
                                }
                            ],
                            [
                                {
                                    "text": "Claim Mining PC",
                                    "callback_data": "Claim Mining PC"
                                }
                            ],
                            [
                                {
                                    "text": "Claim Swap Token Distribution",
                                    "callback_data": "Claim Swap Token Distribution"
                                }
                            ],
                            [
                                {
                                    "text": "Check Wallet Token",
                                    "callback_data": "Check Wallet Token"
                                }
                            ],
                        ]
                    }
                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: req.body.message.chat.id,
                        text: initialTest,
                        reply_markup: JSON.stringify(keyBoard)
                    }).catch(err => {
                        console.log("IDKKKK", err)
                    })
                }
                else {
                    initialTest =
                        "Available comamnd  \n" +
                        "/all - show all available commands \n" +
                        "/connect - connect to metaMask Wallet \n" +
                        "/payment#walletAddress - book for a payment process\n" +
                        "/otp#yourotpcode - confirm your transaction with the otp that we have sended you\n"
                    keyBoard = {
                        "inline_keyboard": [
                            [
                                {
                                    "text": "PROCESS TO PAYMENT",
                                    "callback_data": "PROCESS TO PAYMENT"
                                }
                            ],
                            [
                                {
                                    "text": "CONFIRM PAYMENT",
                                    "callback_data": "CONFIRM PAYMENT"
                                }
                            ],

                        ]
                    }
                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: req.body.message.chat.id,
                        text: initialTest,
                        reply_markup: JSON.stringify(keyBoard)
                    }).catch(err => {
                        console.log("I AM DONEeeee", err)
                    })
                }

                return res.send()
            })
        }
    ).catch(error => {
        console.log("HERE+========================_______________")
        console.log("ERROR", error)
    })
}



app.get("/", (req, res) => {
    res.send(
        "<h2>Backend Is Running</h2>"
    )
})

app.listen(process.env.PORT || 3000, async () => {
    console.log('🚀 app running on port', process.env.PORT || 3000)
    await init()
})