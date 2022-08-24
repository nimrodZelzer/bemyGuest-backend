const logger = require("../../services/logger.service")
const socketService = require("../../services/socket.service")
const orderService = require("./order.service")

async function getOrders(req, res) {
  try {
    const orders = await orderService.query(req.query)
    res.send(orders)
  } catch (err) {
    logger.error("Cannot get orders", err)
    res.status(500).send({ err: "Failed to get orders" })
  }
}

async function getOrder(req, res) {
  try {
    const order = await orderService.getById(req.params.id)
    res.send(order)
  } catch (err) {
    logger.error("Failed to get order", err)
    res.status(500).send({ err: "Failed to get order" })
  }
}

async function addOrder(req, res) {
  // console.log("this is req", req.body)
  try {
    var order = req.body
    order = await orderService.add(order)
    // console.log(order, "orderrrrrrrrrrrrrrrrrrrrrrrr")
    // prepare the updated review for sending out
    // order.toUserId = await userService.getById(order.host._id)

    // console.log("CTRL SessionId:", req.sessionID)
    socketService.on({
      type: "order-added",
      data: order,
      userId: order.guestsDetails.guestId,
    })
    res.send(order)
  } catch (err) {
    logger.error("Failed to add order", err)
    res.status(500).send({ err: "Failed to add order" })
  }
}

async function updateOrder(req, res) {
  try {
    var order = req.body
    const userId = order.guestsDetails.guestId
    order = await orderService.updateOrder(order)
    socketService.emitToUser({
      type: "order-updated",
      data: order,
      userId: userId,
    })
    res.send(order)
  } catch (err) {
    logger.error("Failed to updated order", err),
      res.status(500).send({ err: "Failed to update order" })
  }
}

async function deleteOrder(req, res) {
  try {
    const deletedCount = await orderService.remove(req.params.id)
    if (deletedCount === 1) {
      res.send({ msg: "Deleted successfully" })
    } else {
      res.status(400).send({ err: "Cannot remove order" })
    }
  } catch (err) {
    logger.error("Failed to delete order", err)
    res.status(500).send({ err: "Failed to delete order" })
  }
}

module.exports = {
  getOrders,
  addOrder,
  getOrder,
  updateOrder,
  deleteOrder,
}
