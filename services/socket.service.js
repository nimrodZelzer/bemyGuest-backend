const asyncLocalStorage = require("./als.service")
const logger = require("./logger.service")

var gIo = null

function connectSockets(http, session) {
  gIo = require("socket.io")(http, {
    cors: {
      origin: "*",
    },
  })

  gIo.on("connection", (socket) => {
    // console.log("socket line 15: ", socket)
    // console.log("New socket line13", socket.id)
    socket.userId = socket.id
    socket.on("disconnect", (socket) => {
      // console.log("Someone disconnected")
    })

    socket.on("order-added", async (order) => {
      // console.log("order has added!", order)
      gIo.emit("order-added", order)
    })

    socket.on("order-change", async (order) => {
      // console.log("order has change!", order)
      gIo.emit("order-change", order)
    })

    socket.on("set-user-socket", (userId) => {
      logger.debug(`Setting (${socket.id}) socket.userId = ${userId}`)
      // console.log(userId, "hell yeah")
      socket.userId = userId
    })
    socket.on("unset-user-socket", () => {
      delete socket.userId
    })
  })
}

function emitTo({ type, data, label }) {
  if (label) gIo.to("watching:" + label).emit(type, data)
  else gIo.emit(type, data)
}

async function emitToUser({ type, data, userId }) {
  logger.debug("Emiting to user socket: " + userId) //leonardo
  const socket = await _getUserSocket(userId)
  if (socket) socket.emit(type, data)
  else {
    // console.log("User socket not found")
    _printSockets()
  }
}

// Send to all sockets BUT not the current socket
async function broadcast({ type, data, room = null, userId }) {
  // console.log("BROADCASTING", JSON.stringify(arguments))
  const excludedSocket = await _getUserSocket(userId)
  if (!excludedSocket) {
    // logger.debug('Shouldnt happen, socket not found')
    // _printSockets();
    return
  }
  logger.debug("broadcast to all but user: ", userId)
  if (room) {
    excludedSocket.broadcast.to(room).emit(type, data)
  } else {
    excludedSocket.broadcast.emit(type, data)
  }
}

async function _getUserSocket(userId) {
  const sockets = await _getAllSockets()
  const socket = sockets.find((s) => s.userId == userId)
  return socket
}
async function _getAllSockets() {
  // return all Socket instances
  const sockets = await gIo.fetchSockets()
  return sockets
}
// function _getAllSockets() {
//     const socketIds = Object.keys(gIo.sockets.sockets)
//     const sockets = socketIds.map(socketId => gIo.sockets.sockets[socketId])
//     return sockets;
// }

async function _printSockets() {
  const sockets = await _getAllSockets()
  // console.log(`Sockets: (count: ${sockets.length}):`)
  sockets.forEach(_printSocket)
}
function _printSocket(socket) {
  // console.log("socketline91: ", socket.id)
  // console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`)
}

module.exports = {
  connectSockets,
  emitTo,
  emitToUser,
  broadcast,
}
