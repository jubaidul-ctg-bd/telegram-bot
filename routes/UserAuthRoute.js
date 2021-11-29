const router = require('express').Router()
const validToken = require('../config/accessToken').validToken


/**
 * load controllers
 *
 * @type {controller} list of all Controller
 */
const WalletController = require('../controller/WalletController')

/**
 * initialize controllers
 *
 * @type {object}   authController,
 *                  
 *                  
 */
const walletController = new WalletController()


router.post('/register', authController.register)

router.get('/test', [validToken], (req, res) => {
    console.log(' userAccess : ', req.user.userAccess)
    res.send('Test')
})

module.exports = router