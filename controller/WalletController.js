/**
 * load Importing Multer Module
 * @type {class} FiletModel
 */
/**
 * load File model
 * @type {class} FiletModel
 */
const WalletModel = require('../model/WalletModel')
/**
 * init
 * @type {object} FileModel
 */
const walletModel = new WalletModel()

const { validationResult } = require('express-validator')
/**
 * @type {Response} server response
 */
const response = require('../config/ResponseStatus')
/**
 * load Doctormodel
 * @type {class} Doctormodel
 */
/**
 * class for File Controller
 *
 * @type {class} WalletController
 * @created_at 2th April 2021
 * @created_by Md Tanjin Alam
 */
class WalletController {

    list = async (req, res) => {
        await walletModel.list()
            .then(result => {
                return res.status(200).send(result)
            })
            .catch(err => {
                console.log(" DoctorBannerController :: list ", err)
                return res.status(response.STATUS_SERVER_ERROR).send(err)
            })
    }


    get = async (req, res) => {
        // validate request body data
        const er_obj = validationResult(req)
        if (!er_obj.isEmpty()) {
            let result = this.#getResult(er_obj)
            return res.status(response.STATUS_UNPROCESSABLE_ENTITY).json({ errors: result })
        }

        await walletModel.get(req)
            .then(result => {
                return res.status(200).send(result)
            })
            .catch(err => {
                console.log(" DoctorBannerController :: get ", err)
                return res.status(response.STATUS_SERVER_ERROR).send(err)
            })
    }

    delete = async (req, res) => {
        // validate request body data
        const er_obj = validationResult(req)
        if (!er_obj.isEmpty()) {
            let result = this.#getResult(er_obj)
            return res.status(response.STATUS_UNPROCESSABLE_ENTITY).json({ errors: result })
        }

        await walletModel.delete(req)
            .then(result => {
                return res.status(200).send(result)
            })
            .catch(err => {
                console.log(" DoctorBannerController :: get ", err)
                return res.status(response.STATUS_SERVER_ERROR).send(err)
            })
    }

    insert = async (req, res) => {
        // validate request body data
        const er_obj = validationResult(req)
        if (!er_obj.isEmpty()) {
            let result = this.#getResult(er_obj)
            return res.status(response.STATUS_UNPROCESSABLE_ENTITY).json({ errors: result })
        }

        await walletModel.insert(req)
            .then(result => {
                return res.status(200).send(result)
            })
            .catch(err => {
                console.log(" DoctorBannerController :: get ", err)
                return res.status(response.STATUS_SERVER_ERROR).send(err)
            })
    }

    /**
     * get request error message
     *
     * @param data
     * @return {array}
     * @created_at 20th January 2021
     * @created_by Muhammad hasan
     */
    #getResult = (err) => {
        let result = {}, er_arr = err.array()
        for (let i = 0; i < er_arr.length; i++) {
            result[er_arr[i].param] = er_arr[i].msg
        }
        return result
    }

}

module.exports = WalletController
