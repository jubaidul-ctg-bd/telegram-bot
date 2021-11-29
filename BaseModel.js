const dotenv = require('dotenv');
const Sequelize = require('sequelize')
const fs = require('fs')

/**
 * base model class, every model class should be extends
 * this base model class to get database connection.
 *
 * @type Base Class
 * @author Shafa Care
 * @created_by Muhammad Hasan
 */
class BaseModel {

    /**
     * Database connection
     *
     * @type {Object} private
     * @author Shafa Care
     * @created_by Muhammad Hasan
     */
    #db

    /**
     *  use for store response variables
     *
     * @type {Object}
     * @author Shafa Care
     * @created_by Muhammad Hasan
     */
    #request_response = { 'status': null, 'msg': null, 'data': null }

    /**
     * @type constructor
     * @params
     * @return
     * @author Shafa Care
     * @created_by Muhammad Hasan
     */
    constructor() {
        this.#DBConnection()
    }

    /**
     * init database connection
     *
     * @type method
     * @params
     * @return
     * @author Shafa Care
     * @created_by Muhammad Hasan
     */
    #DBConnection() {
        //console.log(process.cwd());
        this.#db = new Sequelize(
            
            process.env.DB_DATABASE,
            process.env.DB_USERNAME,
            process.env.DB_PASSWORD,
            {
                host: process.env.DB_HOST,
                // connectionLimit: 10,
                dialect: process.env.DB_DIALECT,
                port: process.env.DB_PORT,
                logging: false,
                omitNull: true,
                ssl: true,
                // pool: {
                //     max: 100,
                //     min: 0,
                //     acquire: 30000,
                //     idle: 10000
                //   },
                dialectOptions: {
                    ssl: {
                        ssl: true,
                        rejectUnauthorized: false
                        //cert: fs.readFileSync('/etc/nginx/cert/ca-certificate.crt'),
                    }
                }
            }
        )
        this.#DBConnect()
        return true
    }

    /**
     * test database connection
     *
     * @type method
     * @params
     * @return
     * @author Shafa Care
     * @created_by Muhammad Hasan
     */
    async #DBConnect() {
        try {
            await this.#db.authenticate();
            console.log('Connection has been established successfully.')
        } catch (e) {
            console.error('Unable to connect to the database: ', e)
        }
    }

    /**
     * get database connection object
     *
     * @type {method} public
     * @params
     * @return {Object}
     * @author Shafa Care
     * @created_by Muhammad Hasan
     */
    getDBConnection() {
        return this.#db
    }


    responseFormat(status, data, msg) {
        this.#request_response.status = status
        this.#request_response.data = data
        this.#request_response.msg = msg
        return this.#request_response
    }
}

module.exports = BaseModel