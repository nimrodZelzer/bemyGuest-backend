const dbService = require("../../services/db.service")
const logger = require("../../services/logger.service")
const ObjectId = require("mongodb").ObjectId
const asyncLocalStorage = require("../../services/als.service")
const { broadcast } = require('../../services/socket.service.js')

async function query() {
  try {
    const criteria = {}
    const collection = await dbService.getCollection("order")
    var orders = await collection.find(criteria).toArray()
    return orders
  } catch (err) {
    logger.error("cannot find orders", err)
    throw err
  }
}



async function updateOrder(order) {
  try {
    const orderToSave = order
    orderToSave._id = ObjectId(order._id)
    const collection = await dbService.getCollection("order")
    await collection.updateOne({ _id: orderToSave._id }, { $set: orderToSave })
    return orderToSave
  } catch (err) {
    logger.error("cannot update order", err)
    throw err
  }
}

async function add(order) {
  try {
    const collection = await dbService.getCollection("order")
    await collection.insertOne(order)
    return order
  } catch (err) {
    logger.error("cannot insert order", err)
    throw err
  }
}

async function getById(orderId) {
  try {
    const collection = await dbService.getCollection("order")
    const order = await collection.findOne({ _id: ObjectId(orderId) })
    return order
  } catch (err) {
    logger.error(`while finding user ${orderId}`, err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  if (filterBy.userId) {
    return { orderId: ObjectId(filterBy.user._id) }
  } else if (filterBy.stayId) {
    return { stayId: ObjectId(filterBy.stay._Id) }
  }
  return {}
}

module.exports = {
  query,
  add,
  getById,
  updateOrder,
}


