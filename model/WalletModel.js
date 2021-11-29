const BaseModel = require('./BaseModel')
const response = require('../config/ResponseStatus')
const text = require('../config/TextString')

/**
 * load all required scheme file
 *
 * @type {object}
 * @files walletModel,
 *
 */
const UserWalletScheme = require('./schemes/UserWalletScheme')


class WalletModel extends BaseModel {

    /**
     * private db object
     *
     * @type {object} Database Class
     */
    #db

    /**
     * use for this class common variable to store different types of data
     *
     * @type {variable} this class response
     */
    #result

    /**
     * use for store response variables
     *
     * @type {object} this class response
     */
    response = { 'status': null, 'msg': null, 'data': null }

    /**
     * auth scheme object
     *
     * @type {object} Auth Scheme
     */
    #authObject

    /**
     * column name of common symptoms table to get
     *
     * @type {array} database
     */
    selected_columns = ['id', 'name', 'description', 'status', 'specialistId', 'order']

    /**
     * class constructor
     *
     * @type {constructor}
     * @params
     * @return
     */
    constructor() {
        super();
        this.#db = this.getDBConnection()
    }

    /**
     * get all 
     *
     * @params null
     * @return {Promise<Object>}
     */
    list = async () => {
        let output = { 'status': null, 'msg': null, 'data': null }

        const userWalletScheme = UserWalletScheme.UserWalletScheme(this.#db)

        await userWalletScheme
            .findAll()
            .then(res => {
                output.data = res
                output.msg = text.Data_Found
                output.status = response.STATUS_OK
            })
            .catch(e => {
                output.msg = e
                output.status = response.STATUS_SERVER_ERROR
            })
        return output
    }

    /**
    * get 
    *
    * @params null
    * @return {Promise<Object>}
    */
    get = async (req) => {
        let output = { 'status': null, 'msg': null, 'data': null }

        const userWalletScheme = UserWalletScheme.UserWalletScheme(this.#db)

        await userWalletScheme.findOne({ where: { id: req.body.id } })
            .then(res => {
                if (res) {
                    output.data = res
                    output.msg = text.Data_Found
                    output.status = response.STATUS_OK
                } else {
                    output.data = res
                    output.msg = text.Data_Not_Found
                    output.status = response.STATUS_BAD_REQUEST
                }
            })
            .catch(e => {
                output.msg = e
                output.status = response.STATUS_SERVER_ERROR
            })
        return output
    }

    /**
     * update symptoms by Id
     *
     * @params null
     * @return {Promise<Object>}
     */
    update = async (req) => {
        let output = { 'status': null, 'msg': null, 'data': null }

        const files = Files.FilesScheme(this.#db)
        req.file.path = req.file.key
        req.file.filename = req.file.originalname
        req.file.alt = 'shafa care'
        // req.file.mimetype = 'image/jpeg'

        console.log("req.file", req.file)
        await files.update(req.file, { where: { id: req.file.id } })
            .then(res => {
                if (res[0]) {
                    output.data = res
                    output.msg = text.Data_Updated
                    output.status = response.STATUS_OK
                } else {
                    output.data = res
                    output.msg = text.Data_Update_Failed
                    output.status = response.STATUS_BAD_REQUEST
                }
            })
            .catch(e => {
                output.msg = e
                output.status = response.STATUS_SERVER_ERROR
            })
        return output
    }


    /**
     * delete symptoms by Id
     *
     * @params null
     * @return {Promise<Object>}
     */
    delete = async (body) => {
        let output = { 'status': null, 'msg': null, 'data': null }

        const files = Files.FilesScheme(this.#db)
        if (body.id) {
            await files.destroy({ where: { id: body.id } })
                .then(res => {
                    if (res) {
                        output.data = res
                        output.msg = text.Delete_Success
                        output.status = response.STATUS_OK
                    } else {
                        output.data = res
                        output.msg = text.Delete_Fail
                        output.status = response.STATUS_BAD_REQUEST
                    }
                })
                .catch(e => {
                    output.msg = e
                    output.status = response.STATUS_SERVER_ERROR
                })
        }
        else {
            await files.destroy({ where: { path: body.path } })
                .then(res => {
                    if (res) {
                        output.data = res
                        output.msg = text.Delete_Success
                        output.status = response.STATUS_OK
                    } else {
                        output.data = res
                        output.msg = text.Delete_Fail
                        output.status = response.STATUS_BAD_REQUEST
                    }
                })
                .catch(e => {
                    output.msg = e
                    output.status = response.STATUS_SERVER_ERROR
                })
        }

        return output
    }


    /**
    * insert user wallet
    *
    * @params null
    * @return {Promise<Object>}
    */
    insert = async (data) => {
        let output = { 'status': null, 'msg': null, 'data': null }

        const userWalletScheme = UserWalletScheme.UserWalletScheme(this.#db)

        await userWalletScheme.create(data)
            .then(res => {
                if (res) {
                    output.data = res
                    output.msg = text.Data_Insered
                    output.status = response.STATUS_OK
                } else {
                    output.data = res
                    output.msg = text.Data_Insertion_Failed
                    output.status = response.STATUS_OK
                }
            })
            .catch(e => {
                output.msg = e
                output.status = response.STATUS_SERVER_ERROR
            })

        return output
    }



}

module.exports = WalletModel