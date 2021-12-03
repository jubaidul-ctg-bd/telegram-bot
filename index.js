const dotenv = require('dotenv')
const express = require('express')
const axios = require('axios')
const bodyParser = require('body-parser')
const BNBContractABI = require('./contactsABI/BNBabi.json')

const { getBalance } = require('./myLib/cryptoBalance')
// const { getTokenBalance } = require('./myLib/cryptoTokenAmount')

const conn = require('./config/db_conn');

const Web3 = require("web3");
const ganache = require('ganache-cli');
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

// let web3 = new Web3(provierUrl);
let web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/9e81cde3134f40019b152fafe6d2f265"));


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

async function getTokenBalance(trxHash,chatId) {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: "We are verifying your transaction details...\nplease wait"
    })
    let TransDetails
    let TokenPrice
    const promise1 = await axios.get(`https://api.blockcypher.com/v1/ltc/main/txs/${trxHash}?limit=1`)
        .then(async (res) => {
            await axios.get(`https://api.coingecko.com/api/v3/coins/litecoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
                .then(result => {
                    TokenPrice = result.data.market_data.current_price.usd
                })
            console.log("hhhhhhhhhhhhhhhhhhhh")
            let balance = {
                balance: (res.data["inputs"][0]["output_value"]) * 0.00000001,
                walletAddress: res.data["inputs"][0]["addresses"][0],
                tokenPrice: TokenPrice
            }
            return balance
        }).catch(er => {
            // console.log("ER", er)
            return null
        })

    const promise2 = await axios.get(`https://api.bscscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${trxHash}&apikey=XZY87BD71ZVJH47SS8348X3CJK3IXBWV9C`)
        .then(async (res) => {
            await axios.get(`https://api.coingecko.com/api/v3/coins/binancecoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
                .then(result => {
                    TokenPrice = result.data.market_data.current_price.usd
                })
            console.log("ttttttt")
            if (res.data.result.value) {
                const format = web3.utils.fromWei((res.data.result.value).toString()); // 29803630.997051883414242659
                let balance = {
                    balance: format,
                    total: format,
                    walletAddress: res.data.result.from,
                    tokenPrice: TokenPrice
                }
                return balance
            }

        }).catch(er => {
            return null
        })

    const promise3 = await axios.get(`https://api.blockcypher.com/v1/btc/main/txs/${trxHash}?limit=1`)
        .then(async (res) => {
            await axios.get(`https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
                .then(result => {
                    TokenPrice = result.data.market_data.current_price.usd
                })
            console.log("sssssssss")
            let balance = {
                balance: (res.data["inputs"][0]["output_value"]) * 0.00000001,
                walletAddress: res.data["inputs"][0]["addresses"][0],
                tokenPrice: TokenPrice
            }
            return balance
        }).catch(er => {
            // console.log("ER", er)
            return null
        })

    const promise4 = await axios.get(`https://api.blockcypher.com/v1/eth/main/txs/${trxHash}?limit=1`)
        .then(async (res) => {
            await axios.get(`https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
                .then(result => {
                    TokenPrice = result.data.market_data.current_price.usd
                })
            console.log("yyyyyyyyyy")
            let balance = {
                // balance: (res.data.total) * 0.00000001,
                // total: res.data.total * 0.00000001,
                // walletAddress: res.data["inputs"][0]["addresses"][0]
                balance: (res.data["inputs"][0]["output_value"]) * 0.00000001,
                walletAddress: res.data["inputs"][0]["addresses"][0],
                tokenPrice: TokenPrice
            }
            return balance
        }).catch(er => {
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


// async function asd() {
//     await getTokenBalance("3826e17bbac2724cd74b7377f0bd1489a82440d651016adda0132c42a179ad02")
//         .then((res) => {
//             console.log("asdasd", res)
//         }).catch(err => {
//         })
// }

// asd()


const init = async () => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`).then(
        res => {
            app.post(URI, async (req, res) => {
                console.log("req.body", req.body)

                let chatId
                let initialTest
                let temp
                let count
                let text
                let keyWord
                let flag = 0

                let stageOneGroupUrl = "https://t.me/+6rwSQ_waN403YTk1"
                let stageOneGroupName = "mytest"

                if (!req.body.my_chat_member && req.body.message.text && req.body.message.chat.title == stageOneGroupName) {
                    console.log("Initialized")
                    chatId = req.body.message.chat.id
                    initialTest =
                        "Available comamnd  \n" +
                        "/all - show all available commands \n" +
                        "/walletAddress## - claim your giftBox Example This:/0x885943c5c8cf505a05b960e1d13052d0f033952e##\n"



                    // console.log("REQ.BODY.message", req.body.message)
                    text = req.body.message.text.toLowerCase()

                    temp = req.body.message.text
                    count = (temp.match(/#/g) || []).length;
                    console.log(count);

                }
                // bot is interacting with single user or primary group
                else if (!req.body.my_chat_member && req.body.message.text) {
                    console.log("Initialized=============")
                    chatId = req.body.message.chat.id
                    initialTest =
                        "Available comamnd  \n" +
                        "/all - show all available commands \n" +
                        "/connect - connect to metaMask Wallet \n" +
                        "/payment#walletAddress - book for a payment process\n" +
                        "/otp#otpCode#transactionhash - confirm your transaction with the otp we have sended you\n" +
                        "/walletAddress# - check your wallet BNB balance Example 0x885943c5c8cf505a05b960e1d13052d0f033952e#\n"
                    // "/transactionhash## - check transaction status\n" +
                    // "/walletAddress### - balance check example\n"


                    // console.log("REQ.BODY.message", req.body.message)
                    text = req.body.message.text.toLowerCase()
                    temp = req.body.message.text

                    keyWord = (req.body.message.text).split("#")[0]
                    console.log("keyWord", keyWord)
                    count = (temp.match(/#/g) || []).length;
                    console.log(count);

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
                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: chatId,
                        text: initialTest
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
                    let walletAddress = (req.body.message.text).split("#")[1]
                    if (walletAddress[0] != '0' && walletAddress[1] != 'x') {

                    }
                    let otp = Math.floor(1000 + Math.random() * 9000)


                    let signupQry = "INSERT INTO transaction_info (id, walletAddress, otp) VALUES (?);";
                    let paymentData = [null, walletAddress, otp];


                    conn.query(signupQry, [paymentData], async (err, result, fields) => {
                        if (err) {
                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: "Server is busy try again..."
                            })
                        }
                        else if (result) {
                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: `Wait for while...\nCheck we have inbox you further details`
                            })

                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: req.body.message.from.id,
                                text: `Your Verification code is ${otp}\nDon't share it with anyone.`
                            })
                        }
                    })

                }
                else if (keyWord == "/otp") {

                    console.log("asdasd", keyWord)
                    let otpCode = (req.body.message.text).split("#")[1]
                    let transactionHash = (req.body.message.text).split("#")[2]
                    let walletDetails
                    let walletAddress
                    let amount 

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
                                if (walletDetails.balance * walletDetails.tokenPrice >= 200) {

                                    console.log("walletDetails", walletDetails)
                                    console.log("TOPCODE", otpCode, transactionHash)
                                    walletAddress = walletDetails.walletAddress
                                    amount = walletDetails.balance * walletDetails.tokenPrice
                                    const numberCheckingQry = `SELECT id,walletAddress,success FROM transaction_info WHERE otp LIKE '${otpCode}' AND success = '${0}' AND walletAddress = '${walletAddress}';`;
                                    const dublicateCheck = `SELECT id FROM transaction_info WHERE transactionHash LIKE '${transactionHash}' AND success = '${1}' AND walletAddress = '${walletAddress}';`;

                                    conn.query(dublicateCheck, async (err, result) => {
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
                                        if (result.length > 0) {
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `This transactionhash has been used try a new one`
                                            })
                                        }
                                        else {
                                            conn.query(numberCheckingQry, async (err, result) => {
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
                                                    console.log("HERE I AM HERE")
                                                    // let updateQuery = `UPDATE transaction_info SET success=1 WHERE transactionHas='${otpCode}';`;
                                                    let updateQuery = `UPDATE transaction_info SET success ="${1}",transactionHash ="${transactionHash}" WHERE walletAddress = ?`;
                                                    let values = [walletAddress];
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
                                                            let account = await web3.eth.accounts.create()
                                                            let signupQry = "INSERT INTO user (id, walletAddress, privateKey, amount) VALUES (?);";
                                                            let signupValues = [null, account.address, account.privateKey, amount];
                
                
                                                            conn.query(signupQry, [signupValues], async (err, result, fields) => {
                                                                if (err) {
                                                                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                        chat_id: chatId,
                                                                        text: "Server is busy try again..."
                                                                    })
                                                                }
                
                                                                if (result) {
                                                                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                        chat_id: req.body.message.from.id,
                                                                        text: `${msg}\nYour wallet address is ${account.address}\nDon't share it with anyone.\nJoin here ${stageOneGroupUrl} and claim your token and gift-box`
                                                                    })
                                                                }
                
                                                                // return res.status(200).json({
                                                                //     msg: 'Registration success',
                                                                //     data: {
                                                                //         user_id: result.insertId
                                                                //     }
                                                                // });
                                                            })
                                                            console.log(result)
                                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                chat_id: chatId,
                                                                text: `payment successfull\ncheck your inbox we have provided you further instructions`
                                                            })
                                                        }

                                                    })

                                                } else {
                                                    console.log(result)
                                                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                        chat_id: chatId,
                                                        text: `Invalid OTP or Transactionhash\nTry again...`
                                                    })
                                                }
                                            })
                                        }
                                    })

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
                //check user exist in the database or not for claming token
                else if (count == 1 && req.body.message.chat.title == stageOneGroupName) {
                    let walletKey = req.body.message.text.slice(1, -1)

                    const numberCheckingQry = `SELECT user_id, password FROM user WHERE contact_number LIKE '${value.contact_number}';`;
                    conn.query(numberCheckingQry, (err, result) => {
                        if (err) {
                            return res.status(501).json({
                                msg: "Number checking error",
                                error: err.message
                            })
                        }

                        if (result.length < 1) {
                            return res.status(404).json({
                                msg: "User not found",
                                error: "User not found"
                            })
                        }


                    })





                    console.log("walletKey", walletKey)
                    await checkBalance(walletKey, 2).then(async (res) => {
                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: chatId,
                            text: `Your account BNB Balance is ${res}`
                        })
                    }).catch(async (error) => {
                        console.log("BALANCE EROR", error)
                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: chatId,
                            text: `Invalid Wallet Address`
                        })
                    })
                }
                //checking user exist in the database or not for claming gift-box
                else if (count == 2 && req.body.message.chat.title == stageOneGroupName) {
                    let walletKey = req.body.message.text.slice(1, -1)
                    console.log("walletKey", walletKey)






                    await checkBalance(walletKey, 2).then(async (res) => {
                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: chatId,
                            text: `Your account BNB Balance is ${res}`
                        })
                    }).catch(async (error) => {
                        console.log("BALANCE EROR", error)
                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: chatId,
                            text: `Invalid Wallet Address`
                        })
                    })
                }
                else if (count == 1) {
                    let walletKey = req.body.message.text.slice(1, -1)
                    console.log("walletKey", walletKey)
                    await checkBalance(walletKey, 2).then(async (res) => {
                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: chatId,
                            text: `Your account BNB Balance is ${res}`
                        })
                    }).catch(async (error) => {
                        console.log("BALANCE EROR", error)
                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: chatId,
                            text: `Invalid Wallet Address`
                        })
                    })
                }
                else if (count == 2) {
                    let msg = "No transaction found"
                    let trxHash = req.body.message.text.slice(1, -1)
                    let currentBalance
                    console.log("Working")
                    //checking previous balance
                    await checkBalance("empty", 3).then(async (res) => {
                        currentBalance = res
                        if (res) {
                            await axios.get(`https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${trxHash}&apikey=CDWRF4K5C8NC3YZK7K69MZDSRVXHTFE4WB`, {
                            }).then(async (res) => {
                                // let bigNumber = web3.toBigNumber('0xFFFFFF')
                                // let value = web3.fromWei(res.data.value)
                                // console.log("value", value)
                                if (res.data) {
                                    msg = "Transaction was successful"
                                    await checkBalance("empty", 3).then(async (res) => {
                                        let tokenAmount = (res - currentBalance)
                                        if (tokenAmount == 0) {
                                            console.log("tokenAmount", tokenAmount)
                                            let account = await web3.eth.accounts.create()
                                            console.log("tokenAmount", account)

                                            let signupQry = "INSERT INTO user (id, walletAddress, privateKey, amount) VALUES (?);";
                                            let signupValues = [null, account.address, account.privateKey, tokenAmount];


                                            conn.query(signupQry, [signupValues], async (err, result, fields) => {
                                                if (err) {
                                                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                        chat_id: chatId,
                                                        text: "Server is busy try again..."
                                                    })
                                                }

                                                if (result) {
                                                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                        chat_id: chatId,
                                                        text: `${msg}\n Check we have inbox you further details`
                                                    })
                                                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                        chat_id: req.body.message.from.id,
                                                        text: `${msg}\nYour wallet address is ${account.address}\nDon't share it with anyone.\nJoin here ${stageOneGroupUrl} and claim your token and gift-box`
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
                                        // if(tokenAmount == .5){
                                        //     await web3.eth.accounts.create().then(res=>{
                                        //             console.log("res",res)
                                        //         }
                                        //     )
                                        // }
                                        // else if(tokenAmount == 1){

                                        // }
                                        // else if (tokenAmount== 2){

                                        // }

                                    })



                                }
                            })
                        }
                    }).catch(async (error) => {
                        console.log("error", error)
                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: chatId,
                            text: "Invalid Transaction Hash Number"
                        })
                    })


                }
                // receving unknown msg 
                else {
                    console.log("ELSE=======GROUP", req.body)

                    // if( req.body.message.chat.title == "mytest"){

                    // }
                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: chatId,
                        text: initialTest
                    }).catch(e => {
                        console.log("+++++", e);
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