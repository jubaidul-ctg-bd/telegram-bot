const axios = require('axios')
const conn = require('../config/db_conn');

async function checkWalletBalance(user_wallet_id, testnet) {
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
    console.log("walletAddress==========", walletAddress)
    let TransDetails
    let TokenPrice
    if (testnet == 1) {

        // await axios.post(`${TELEGRAM_API}/sendMessage`, {
        //     chat_id: chatId,
        //     text: "We are verifying your transaction details...\nplease wait"
        // })


        const promise1 = await axios.get(`https://chain.so/api/v2/get_address_balance/LTCTEST/${walletAddress[1].walletAddress}`)
            .then(async (res) => {
                // await axios.get(`https://api.coingecko.com/api/v3/coins/litecoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
                //     .then(result => {
                //         TokenPrice = result.data.market_data.current_price.usd
                //     }).catch(er=>{
                //         console.log("MAIN ERROR====111")
                //     })
                console.log("res.data.confirmed_balance", res.data.data.confirmed_balance)
                let balance = {
                    // balance: (res.data.final_balance) * 0.00000001,
                    balance: res.data.data.confirmed_balance
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

module.exports = {
    checkWalletBalance,checkGroupAccess
}