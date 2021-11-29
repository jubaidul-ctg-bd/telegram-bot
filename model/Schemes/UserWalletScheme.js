const { DataTypes } = require('sequelize')

module.exports.UserWalletScheme = (sequelize) => {

    const WalletScheme = sequelize.define('user_wallets', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        walletAddress: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        privateKey: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        tokenAmount: {
            type: DataTypes.INTEGER(12),
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        paranoid: true,
        timestamp: true
    })

    return WalletScheme
}


