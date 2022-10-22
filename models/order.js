const Sequelize = require('sequelize')
const sequelize = require('../util/database')

const Order = sequelize.define('orders', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    quantity: Sequelize.INTEGER,
})

module.exports = Order