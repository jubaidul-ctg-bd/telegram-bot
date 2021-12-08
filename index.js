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

async function checkWalletBalance(walletAddress) {
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

async function asd() {
    await axios.get(`https://api.bscscan.com/api?module=account&action=balance&address=0x70F657164e5b75689b64B7fd1fA275F334f28e18&apikey=XZY87BD71ZVJH47SS8348X3CJK3IXBWV9C`)
        .then(async (res) => {
            console.log("res",res.data)
            const format = web3.utils.fromWei((res.data.result).toString()); // 29803630.997051883414242659
            const balance = res.data.result * 0.00000001 // 29803630.997051883414242659
            console.log("format",format)
            console.log("format",balance)
            // // await axios.get(`https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
            // //     .then(result => {
            // //         TokenPrice = result.data.market_data.current_price.usd
            // //     })
            // console.log("sssssssss")
            // let balance = {
            //     balance: (res.data["inputs"][0]["output_value"]) * 0.00000001,
            //     walletAddress: res.data["inputs"][0]["addresses"][0],
            //     tokenPrice: btcPrice
            // }
            // return balance
        }).catch(er => {
            console.log("ER3")
            return null
        })
}

// asd()
let customMessage
async function storeWalletAddress(walletAddress) {
    const isExist = `SELECT id FROM wallet_info WHERE walletAddress LIKE '${walletAddress}';`;
    let insertWalletQuery = "INSERT INTO wallet_info (id, walletAddress) VALUES (?);";
    let paymentData = [null, walletAddress];
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


async function userDetails(user_id) {
    const userndUserRegisterQuery = `
                    SELECT user_wallet.*, register_user.*
                    FROM user_wallet 
                    JOIN register_user
                    ON user_wallet.id=register_user.user_wallet_id
                    WHERE user_id LIKE '${user_id}'`;

    return new Promise((resolve, reject) => {
        conn.query(userndUserRegisterQuery, (err, result) => {
            console.log("result======", result.token)
            console.log("result++++++", result[0].token)
            if (err) {
                return reject(err)
            }
            else if (result.length > 0) {
                if (result[0].token == 1) {
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
            } else {
                customMessage = "error"
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
                let stageOneGroupUrl = "https://t.me/+6rwSQ_waN403YTk1"
                let stageOneGroupName = "mytest"

                let userWalletAddress
                let keyBoard
                //requesting from firstStage group
                if (req.body.callback_query) {
                    chatId = req.body.callback_query.from.id
                    text = req.body.callback_query.data
                }
                else if (!req.body.my_chat_member && req.body.message.text && req.body.message.chat.title == stageOneGroupName) {
                    // console.log("Initialized first group", req)


                    chatId = req.body.message.chat.id
                    userId = req.body.message.from.id
                    userWalletAddress = (req.body.message.text).split("#")[1]

                    await userDetails(userId).then(res => {
                        console.log("value=====", res)
                        initialTest = res
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
                                        "text": "OTP",
                                        "callback_data": "OTP"
                                    }
                                ],
                                [
                                    {
                                        "text": "Savings",
                                        "callback_data": "savings"
                                    }
                                ]
                            ]
                        }
                        //counting # in a string
                        // count = (temp.match(/#/g) || []).length;
                        // console.log(count);
                    }).catch(err => {
                        console.log("====================", err)



                        initialTest =
                            "Available comamnd  \n" +
                            "/all - show all available commands \n" +
                            // "/walletAddress## - claim your giftBox Example This:/0x885943c5c8cf505a05b960e1d13052d0f033952e##\n"
                            `/claimtoken#walletAddress - ${msg1}\n` +
                            `/claimnft#walletAddress - ${msg2}\n` +
                            `/claimwatchwallet#walletAddress - ${msg3}\n` +
                            `/claimminingpc#walletAddress - ${msg4}\n` +
                            `/claimswaptoken#walletAddress - ${msg5}\n` +
                            `/giftboxstatus - see your gift-box information \n`


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
                                        "text": "OTP",
                                        "callback_data": "OTP"
                                    }
                                ],
                                [
                                    {
                                        "text": "Savings",
                                        "callback_data": "savings"
                                    }
                                ]
                            ]
                        }
                        //counting # in a string
                        // count = (temp.match(/#/g) || []).length;
                        // console.log(count);
                    })


                }
                // bot is interacting with single user or primary group
                else if (!req.body.my_chat_member && req.body.message.text) {
                    console.log("Initialized============= Here", req.body)
                    chatId = req.body.message.chat.id
                    initialTest =
                        "Available comamnd  \n" +
                        "/all - show all available commands \n" +
                        "/connect - connect to metaMask Wallet \n" +
                        "/payment#walletAddress - book for a payment process\n" +
                        "/otp#otpCode#transactionhash - confirm your transaction with the otp that we have sended you\n"
                    // "/transactionhash## - check transaction status\n" +
                    // "/walletAddress### - balance check example\n"


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
                            // [
                            //     {
                            //         "text": "Savings",
                            //         "callback_data": "savings"
                            //     }
                            // ]
                        ]
                    }

                }
                else if (!req.body.text && !req.body.my_chat_member) {

                    console.log("HERE TEXT CANT!!!!!!!!!!!!!!!", req.body)
                    req.body.message.text = "Available comamnd  \n" +
                        "/all - show all available commands \n" +
                        "/connect - connect to metaMask Wallet \n" +
                        "/walletAddress# - check your wallet BNB balance Example 0x885943c5c8cf505a05b960e1d13052d0f033952e#\n" +
                        "/transactionhash## - check transaction status\n" +
                        "/walletAddress### - balance check example\n"
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




                if (req.body.my_chat_member) {
                    console.log("==================", req.body.my_chat_member.from.id)
                }
                else if (text == 'Claim Token') {
                    console.log("TESTING=========", req.body)
                    console.log("TESTING=========", req.body.callback_query.message.chat.id)
                    console.log(chatId)
                    console.log(text)
                    const mtext = "Claim your wallet token follow the input format\nWrite /claimtoken# then your wallet address"

                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: req.body.callback_query.message.chat.id,
                        text: mtext,
                        reply_markup: JSON.stringify(keyBoard)
                    })
                }
                else if (text == 'PROCESS TO PAYMENT') {
                    console.log("TESTING=========", req.body)
                    console.log("TESTING=========", req.body)
                    console.log(chatId)
                    console.log(text)
                    const mtext = "Start your payment process follow the input format\nWrite /payment# then your wallet address"

                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: req.body.callback_query.message.chat.id,
                        text: mtext,
                        reply_markup: JSON.stringify(keyBoard)
                    })
                }
                else if (text == 'CONFIRM PAYMENT') {
                    console.log("TESTING=========", req.body)
                    console.log(chatId)
                    console.log(text)
                    const mtext = "Confirm your transaction follow the input format\nWrite /otp# then write the otp code# then write your transaction hash"

                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: chatId,
                        text: mtext,
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
                else if (text == "/start") {
                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: chatId,
                        text: initialTest
                    })
                }
                else if (req.body.message.text == "/walletAddress") {
                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: chatId,
                        text: "Write the command like /YourWalletAddress#"
                    })
                }
                else if (text == "/all") {
                    console.log("HERE============", keyBoard)
                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: chatId,
                        text: initialTest,
                        reply_markup: JSON.stringify(keyBoard)
                    })
                }
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

                            await storeWalletAddress(walletAddress).then(async (result) => {
                                console.log("res=================", result[0].id)
                                let bitcoinWalletData = [null, result[0].id, addressBTC, privateKeyBTC, "BTC"];
                                let litecoinWalletData = [null, result[0].id, addressLTC, privateKeyLTC, "LTC"];
                                let ethWalletData = [null, result[0].id, account.address, account.privateKey, "ETH"];


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
                                    text: `Your Verification code is ${otp}\nDon't share it with anyone.`
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
                else if (keyWord == "/otp") {

                    let otpCode = (req.body.message.text).split("#")[1]
                    let transactionHash = (req.body.message.text).split("#")[2]
                    let walletDetails
                    let walletAddress
                    let amount
                    console.log("asdasd=====", keyWord, otpCode)
                    console.log("transactionHash", transactionHash)
                    await getTokenBalance(transactionHash, chatId)
                        .then(async (res) => {
                            console.log("asdasasd", res)
                            if (res[0] || res[1] || res[2] || res[3]) {
                                if (res[0]) {
                                    walletDetails = res[0]
                                } else if (res[1]) {
                                    walletDetails = res[1]
                                } else if (res[2]) {
                                    walletDetails = res[2]
                                } else if (res[3]) {
                                    walletDetails = res[3]
                                }

                                console.log("walletDetails.balance", walletDetails.balance)
                                console.log("walletDetails.balance", walletDetails.tokenPrice)
                                if (walletDetails.balance * walletDetails.tokenPrice >= 1) {

                                    console.log("walletDetails", walletDetails)
                                    console.log("TOPCODE", otpCode, transactionHash)
                                    walletAddress = walletDetails.walletAddress
                                    amount = walletDetails.balance * walletDetails.tokenPrice

                                    const userTrxQuery = `SELECT * FROM wallet_info WHERE otp LIKE '${otpCode}'  AND walletAddress = '${walletAddress}';`;
                                    // const dublicateCheck = `SELECT * FROM transaction_info WHERE walletAddress LIKE '${walletAddress}' AND success = '${1}' AND walletAddress = '${walletAddress}';`;

                                    let wallet_id
                                    let user_wallet_id

                                    //verify user walletExist with otp
                                    conn.query(userTrxQuery, async (err, result) => {
                                        console.log("asdadada", result)
                                        if (err) {
                                            // return res.status(501).json({
                                            //     msg: "Number checking error",
                                            //     error: err.message
                                            // })
                                            console.log("adadad", err)
                                            console.log("erro", err)
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server busy try again later...`
                                            })
                                        }
                                        // real trx hash validated successful 
                                        else if (result.length > 0) {
                                            wallet_id = result[0].id

                                            const transactionChckQuery = `SELECT * FROM transaction_info WHERE transactionHash LIKE '${transactionHash}';`;

                                            conn.query(transactionChckQuery, async (err, result) => {
                                                console.log("rechecking transactionHash", result)
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
                                                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                        chat_id: chatId,
                                                        text: `This transaction was used`
                                                    })
                                                    //valid transactionHash checking user has account or not
                                                } else {
                                                    console.log("wallet_id", wallet_id)
                                                    const userWalletQuery = `SELECT wallet_info.*, user_wallet.*FROM wallet_info
                                                    JOIN user_wallet
                                                    ON wallet_info.id = user_wallet.wallet_id
                                                    WHERE wallet_info.id LIKE '${wallet_id}';`;

                                                    //checking user has account or not
                                                    conn.query(userWalletQuery, async (err, result) => {
                                                        console.log("wallet and transaction details", result, err)
                                                        if (err) {
                                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                chat_id: chatId,
                                                                text: `Server busy try again later...`
                                                            })
                                                        }
                                                        //create user account since .. associated user account was not founded
                                                        else if (result.length == 0) {
                                                            console.log("HERE I AM HERE creating wallet for first time", result, transactionHash)
                                                            // let updateQuery = `UPDATE transaction_info SET success=1 WHERE transactionHas='${otpCode}';`;
                                                            let inserTransactionQuery = "INSERT INTO transaction_info (id, wallet_id, transactionHash) VALUES (?);";
                                                            let values = [null, wallet_id, transactionHash];
                                                            // let updateQuery = `UPDATE transaction_info SET success ="${1}",transactionHash ="${transactionHash}" WHERE walletAddress = ?`;
                                                            // let values = [walletAddress];
                                                            conn.query(inserTransactionQuery, [values], async (err, result) => {
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
                                                                //creating new wallet  
                                                                else {
                                                                    console.log("creaing wallet", result)
                                                                    let account = await web3.eth.accounts.create()


                                                                    let user_wallet = "INSERT INTO user_wallet (id, walletAddress, privateKey,wallet_id, amount) VALUES (?);";
                                                                    let wallet_data = [null, account.address, account.privateKey, wallet_id, amount];
                                                                    let register_user_data

                                                                    conn.query(user_wallet, [wallet_data], async (err, result, fields) => {
                                                                        if (err) {
                                                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                                chat_id: chatId,
                                                                                text: "Server is busy try again..."
                                                                            })
                                                                        }
                                                                        //inbox user with walletId
                                                                        else {


                                                                            const userWalletQuery = `SELECT * FROM user_wallet WHERE privateKey LIKE '${account.privateKey}' ;`;
                                                                            let user_wallet_id

                                                                            conn.query(userWalletQuery, async (err, result) => {
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
                                                                                //creating registerd user details 
                                                                                else if (result.length > 0) {
                                                                                    user_wallet_id = result[0].id

                                                                                    let register_user = "INSERT INTO register_user (id, user_wallet_id, user_id) VALUES (?);";
                                                                                    register_user_data = [null, user_wallet_id, req.body.message.from.id];

                                                                                    //payment successfuly msg to group
                                                                                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                                        chat_id: chatId,
                                                                                        text: `payment successfull\ncheck your inbox we have provided you further instructions`
                                                                                    })



                                                                                    // store register user details 
                                                                                    conn.query(register_user, [register_user_data], async (err, result, fields) => {
                                                                                        if (err) {
                                                                                            console.log("err", err)
                                                                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                                                chat_id: chatId,
                                                                                                text: "Server is busy try again..."
                                                                                            })
                                                                                        }
                                                                                        //
                                                                                        else {
                                                                                            //inbox user with wallet address
                                                                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                                                chat_id: req.body.message.from.id,
                                                                                                text: `Transaction was successfull\nYour wallet address is ${account.address}\nDon't share it with anyone.\nJoin here ${stageOneGroupUrl} and claim your token and see gift-box status`
                                                                                            })
                                                                                        }

                                                                                    })

                                                                                }
                                                                            })

                                                                        }

                                                                        // return res.status(200).json({
                                                                        //     msg: 'Registration success',
                                                                        //     data: {
                                                                        //         user_id: result.insertId
                                                                        //     }
                                                                        // });
                                                                    })

                                                                }

                                                            })
                                                        }
                                                        //use has already account
                                                        else {
                                                            let user_wallet_id = result[0].id
                                                            console.log("resultresult", result)
                                                            console.log("user_wallet_id", user_wallet_id)
                                                            let inserTransactionQuery = "INSERT INTO transaction_info (id, wallet_id, transactionHash) VALUES (?);";
                                                            let values = [null, user_wallet_id, transactionHash];
                                                            // let updateQuery = `UPDATE transaction_info SET success ="${1}",transactionHash ="${transactionHash}" WHERE walletAddress = ?`;
                                                            // let values = [walletAddress];
                                                            conn.query(inserTransactionQuery, [values], async (err, result) => {
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
                                                                //new transaction was successful 
                                                                else {
                                                                    // let updateQuery = `UPDATE transaction_info SET success ="${1}",transactionHash ="${transactionHash}" WHERE walletAddress = ?`;
                                                                    let updateQuery = `
                                                                    UPDATE user_wallet 
                                                                    SET amount = amount + ${amount}
                                                                    WHERE wallet_id = '${user_wallet_id}'
                                                                `;
                                                                    conn.query(updateQuery, async (err, result) => {
                                                                        if (err) {
                                                                            console.log("err-r", err)
                                                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                                chat_id: chatId,
                                                                                text: `Server busy try again later...`

                                                                            })
                                                                        } else {
                                                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                                chat_id: chatId,
                                                                                text: `payment successfull you can check your balance`

                                                                            })
                                                                        }
                                                                    })


                                                                }
                                                            })
                                                        }

                                                    })
                                                }
                                            })

                                        } else {
                                            console.log("===================", result, err)
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Invalid OTP or Transactionhash\nTry again...`
                                            })
                                        }
                                    })


                                    //checking fraud entry with same trx hash
                                    // conn.query(dublicateCheck, async (err, result) => {
                                    //     if (err) {
                                    //         // return res.status(501).json({
                                    //         //     msg: "Number checking error",
                                    //         //     error: err.message
                                    //         // })
                                    //         console.log("erro", err)
                                    //         await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    //             chat_id: chatId,
                                    //             text: `Server busy try again later...`
                                    //         })
                                    //     }
                                    //     if (result.length > 0) {
                                    //         await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    //             chat_id: chatId,
                                    //             text: `This transactionhash has been used try a new one`
                                    //         })
                                    //     }
                                    //     // with real trx hash 
                                    //     else {

                                    //     }
                                    // })

                                }
                                else {
                                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                        chat_id: chatId,
                                        text: "Transaction amount is less than required"
                                    })
                                }

                            }
                            else {
                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: "Unable to locate your transactionhash try again later..."
                                })
                            }

                        }).catch(async (err) => {
                            console.log("ERROR", err)
                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: "Invalid Transaction Hash Number"
                            })
                        })


                }
                else if (keyWord == "/claimtoken") {
                    let walletAddress = (req.body.message.text).split("#")[1]


                    let updateQuery = `UPDATE transaction_info SET tokenClaim ="${1}" WHERE walletAddress = ?`;
                    let values = [walletAddress];
                    const tokenClaimDetails = `SELECT * FROM transaction_info WHERE walletAddress LIKE '${walletAddress}' AND tokenClaim = '${0}' ;`;
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
                                    sendTestBnb(walletAddress)
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
                //check user exist in the database or not for claming token
                // else if (count == 1 && req.body.message.chat.title == stageOneGroupName) {
                //     let walletKey = req.body.message.text.slice(1, -1)

                //     const numberCheckingQry = `SELECT user_id, password FROM user WHERE contact_number LIKE '${value.contact_number}';`;
                //     conn.query(numberCheckingQry, (err, result) => {
                //         if (err) {
                //             return res.status(501).json({
                //                 msg: "Number checking error",
                //                 error: err.message
                //             })
                //         }

                //         if (result.length < 1) {
                //             return res.status(404).json({
                //                 msg: "User not found",
                //                 error: "User not found"
                //             })
                //         }


                //     })





                //     console.log("walletKey", walletKey)
                //     await checkBalance(walletKey, 2).then(async (res) => {
                //         await axios.post(`${TELEGRAM_API}/sendMessage`, {
                //             chat_id: chatId,
                //             text: `Your account BNB Balance is ${res}`
                //         })
                //     }).catch(async (error) => {
                //         console.log("BALANCE EROR", error)
                //         await axios.post(`${TELEGRAM_API}/sendMessage`, {
                //             chat_id: chatId,
                //             text: `Invalid Wallet Address`
                //         })
                //     })
                // }
                // //checking user exist in the database or not for claming gift-box
                // else if (count == 2 && req.body.message.chat.title == stageOneGroupName) {
                //     let walletKey = req.body.message.text.slice(1, -1)
                //     console.log("walletKey", walletKey)






                //     await checkBalance(walletKey, 2).then(async (res) => {
                //         await axios.post(`${TELEGRAM_API}/sendMessage`, {
                //             chat_id: chatId,
                //             text: `Your account BNB Balance is ${res}`
                //         })
                //     }).catch(async (error) => {
                //         console.log("BALANCE EROR", error)
                //         await axios.post(`${TELEGRAM_API}/sendMessage`, {
                //             chat_id: chatId,
                //             text: `Invalid Wallet Address`
                //         })
                //     })
                // }
                // else if (count == 1) {
                //     let walletKey = req.body.message.text.slice(1, -1)
                //     console.log("walletKey", walletKey)
                //     await checkBalance(walletKey, 2).then(async (res) => {
                //         await axios.post(`${TELEGRAM_API}/sendMessage`, {
                //             chat_id: chatId,
                //             text: `Your account BNB Balance is ${res}`
                //         })
                //     }).catch(async (error) => {
                //         console.log("BALANCE EROR", error)
                //         await axios.post(`${TELEGRAM_API}/sendMessage`, {
                //             chat_id: chatId,
                //             text: `Invalid Wallet Address`
                //         })
                //     })
                // }
                // else if (count == 2) {
                //     let msg = "No transaction found"
                //     let trxHash = req.body.message.text.slice(1, -1)
                //     let currentBalance
                //     console.log("Working")
                //     //checking previous balance
                //     await checkBalance("empty", 3).then(async (res) => {
                //         currentBalance = res
                //         if (res) {
                //             await axios.get(`https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${trxHash}&apikey=CDWRF4K5C8NC3YZK7K69MZDSRVXHTFE4WB`, {
                //             }).then(async (res) => {
                //                 // let bigNumber = web3.toBigNumber('0xFFFFFF')
                //                 // let value = web3.fromWei(res.data.value)
                //                 // console.log("value", value)
                //                 if (res.data) {
                //                     msg = "Transaction was successful"
                //                     await checkBalance("empty", 3).then(async (res) => {
                //                         let tokenAmount = (res - currentBalance)
                //                         if (tokenAmount == 0) {
                //                             console.log("tokenAmount", tokenAmount)
                //                             let account = await web3.eth.accounts.create()
                //                             console.log("tokenAmount", account)

                //                             let signupQry = "INSERT INTO user (id, walletAddress, privateKey, amount) VALUES (?);";
                //                             let signupValues = [null, account.address, account.privateKey, tokenAmount];


                //                             conn.query(signupQry, [signupValues], async (err, result, fields) => {
                //                                 if (err) {
                //                                     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                //                                         chat_id: chatId,
                //                                         text: "Server is busy try again..."
                //                                     })
                //                                 }

                //                                 if (result) {
                //                                     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                //                                         chat_id: chatId,
                //                                         text: `${msg}\n Check we have inbox you further details`
                //                                     })
                //                                     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                //                                         chat_id: req.body.message.from.id,
                //                                         text: `${msg}\nYour wallet address is ${account.address}\nDon't share it with anyone.\nJoin here ${stageOneGroupUrl} and claim your token and gift-box`
                //                                     })
                //                                 }

                //                                 // return res.status(200).json({
                //                                 //     msg: 'Registration success',
                //                                 //     data: {
                //                                 //         user_id: result.insertId
                //                                 //     }
                //                                 // });
                //                             })

                //                         }
                //                         // if(tokenAmount == .5){
                //                         //     await web3.eth.accounts.create().then(res=>{
                //                         //             console.log("res",res)
                //                         //         }
                //                         //     )
                //                         // }
                //                         // else if(tokenAmount == 1){

                //                         // }
                //                         // else if (tokenAmount== 2){

                //                         // }

                //                     })



                //                 }
                //             })
                //         }
                //     }).catch(async (error) => {
                //         console.log("error", error)
                //         await axios.post(`${TELEGRAM_API}/sendMessage`, {
                //             chat_id: chatId,
                //             text: "Invalid Transaction Hash Number"
                //         })
                //     })


                // }
                // receving unknown msg 
                else {
                    console.log("ELSE=======GROUP", req.body)

                    // if( req.body.message.chat.title == "mytest"){

                    // }
                    if (req.body.message.chat.title == 'mytest') {
                        console.log("CHECKING UPPP")
                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: chatId,
                            text: text
                        }).catch(e => {
                            // console.log("+++++", e);
                        })
                    }
                    else {
                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: chatId,
                            text: text
                        }).catch(e => {
                            // console.log("+++++", e);
                        })
                    }

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