

async function privateMessage(message, text) {
    console.log('mee',message)
    return message.author.send(text)
}

async function channelMessage(message, text) {
    return message.channel.send(text)
}


module.exports = {
    privateMessage,channelMessage
}