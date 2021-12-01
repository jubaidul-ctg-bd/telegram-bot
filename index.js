const dotenv = require('dotenv')
const express = require('express')
const axios = require('axios')
const bodyParser = require('body-parser')
const BNBContractABI = require('./contactsABI/BNBabi.json')

const { getBalance } = require('./myLib/cryptoBalance')
const { getTokenBalance } = require('./myLib/cryptoTokenAmount')

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

        const format = web3.utils.fromWei(result); // 29803630.997051883414242659

        console.log("format", format);
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

getBalance("LTC","LcFFkbRUrr8j7TMi8oXUnfR4GPsgcXDepo")
.then(res=>{
    console.log("res",res);
})
         


const init = async () => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`).then(
        res => {
            console.log("response===========",res)
            app.post(URI, async (req, res) => {
                console.log("req.body", req.body)


                

                let chatId
                let initialTest
                let temp
                let count
                let text
                let flag = 0


                let stageOneGroupUrl = "https://t.me/+6rwSQ_waN403YTk1"
                let stageOneGroupName = "mytest"

                if (!req.body.my_chat_member && req.body.message.text && req.body.message.chat.title == stageOneGroupName) {
                    console.log("Initialized")
                    chatId = req.body.message.chat.id
                    initialTest =
                        "Available comamnd  \n" +
                        "/all - show all available commands \n" +
                        "/walletAddress# - claim your tokens Example /0x885943c5c8cf505a05b960e1d13052d0f033952e##\n" +
                        "/walletAddress## - claim your giftBox Example /0x885943c5c8cf505a05b960e1d13052d0f033952e##\n"



                    // console.log("REQ.BODY.message", req.body.message)
                    text = req.body.message.text.toLowerCase()

                    temp = req.body.message.text
                    count = (temp.match(/#/g) || []).length;
                    console.log(count);

                }
                else if (!req.body.my_chat_member && req.body.message.text) {
                    console.log("Initialized")
                    chatId = req.body.message.chat.id
                    initialTest =
                        "Available comamnd  \n" +
                        "/all - show all available commands \n" +
                        "/connect - connect to metaMask Wallet \n" +
                        "/walletAddress# - check your wallet BNB balance Example 0x885943c5c8cf505a05b960e1d13052d0f033952e#\n" +
                        "/transactionhash## - check transaction status\n" +
                        "/walletAddress### - balance check example\n"


                    // console.log("REQ.BODY.message", req.body.message)
                    text = req.body.message.text.toLowerCase()

                    temp = req.body.message.text
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