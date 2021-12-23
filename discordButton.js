
const discord = require('discord.js');
const { MessageButton } = require('discord-buttons')

async function buttonMsg(message, text) {

    const processMsg = new discord.MessageEmbed()
        .setTitle("You are verified\n we have inboxed you all details")
        .setColor("BLUE")

    const completeMsg = new discord.MessageEmbed()
        .setTitle("We are checking your transaction...")
        .setColor("BLUE")

    const processToPayment = new MessageButton()
        .setStyle("green")
        .setLabel("GET REGISTER")
        .setID("processToPayment")

    const paymentComplete = new MessageButton()
        .setStyle("green")
        .setLabel("CHECK YOUR PAYMENT")
        .setID("paymentComplete")


    await message.channel.send("Follow The Process To Get Register ", {
        buttons: [processToPayment, paymentComplete],
        embeds: [processMsg, completeMsg]
    }).then(res => {
        // console.log("BUTTON RES", res)
    }).catch(er => {
        // console.log("BUTTON ER", er)
    })

}


async function buttonGift(message, text) {

    const processMsg = new discord.MessageEmbed()
        .setTitle("You are verified\n we have inboxed you all details")
        .setColor("BLUE")

    const completeMsg = new discord.MessageEmbed()
        .setTitle("We are checking your transaction...")
        .setColor("BLUE")

    const token = new MessageButton()
        .setStyle("green")
        .setLabel("Claim Token")
        .setID("token")

    const nft = new MessageButton()
        .setStyle("green")
        .setLabel("Claim NFT")
        .setID("nft")


    const watch = new MessageButton()
        .setStyle("green")
        .setLabel("Claim Watch")
        .setID("watch")


    const pc = new MessageButton()
        .setStyle("green")
        .setLabel("Claim Mining Pc")
        .setID("pc")


    const swapToken = new MessageButton()
        .setStyle("green")
        .setLabel("Claim Swap-Token")
        .setID("swapToken")




    await message.channel.send("Claim Your Gift Click Here ", {
        buttons: [token, nft, watch, pc, swapToken]
    }).then(res => {
        // console.log("BUTTON RES", res)
    }).catch(er => {
        // console.log("BUTTON ER", er)
    })

}


module.exports = {
    buttonMsg, buttonGift
}












