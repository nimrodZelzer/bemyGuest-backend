const dbService = require("../../services/db.service")
const logger = require("../../services/logger.service")
const ObjectId = require("mongodb").ObjectId
const asyncLocalStorage = require("../../services/als.service")

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

async function query1(filterBy = {}) {
  const collection = await dbService.getCollection("order")
  console.log("collection line 8", collection)
  try {
    var orders = await collection
      .aggregate([
        {
          $match: _buildCriteria(filterBy),
        },
        {
          $lookup: {
            from: "stay",
            foreignField: "_id",
            localField: "stayId",
            as: "aboutStay",
          },
        },
        {
          $unwind: "$aboutStay",
        },
        {
          $lookup: {
            from: "user",
            foreignField: "_id",
            localField: "host",
            as: "toHost",
          },
        },
        {
          $unwind: "$toHost",
        },
        // {
        //   $lookup: {
        //     from: "stay",
        //     foreignField: "host",
        //     localField: "toHost",
        //     as: "host",
        //   },
        // },
        // {
        //   $unwind: "$host",
        // },
        {
          $project: {
            _id: 1,
            checkin: 1,
            checkout: 1,
            guests: 1,
            guestsDetails: 1,
            totalPrice: 1,
            aboutStay: { price: 1, _id: 1, name: 1, host: 1 },
            status: 1,
            toHost: { _id: 1, fullname: 1 },
          },
        },
      ])
      .toArray()

    // orders = orders.map((order) => {
    //   //   order.byUser = { _id: order.byUser._id, fullname: order.byUser.fullname }
    //   console.log("orderrrrrr line52: ", order)
    //   order.toHost = {
    //     _id: order.fromHost._id,
    //     fullname: order.fromHost.fullname,
    //   }

    //   order.aboutStay = {
    //     _id: order.aboutStay._id,
    //     name: order.aboutStay.name,
    //     price: order.aboutStay.price,
    //     startDate: order.aboutStay.startDate,
    //     endDate: order.aboutStay.endDate,
    //     guestDetails: {
    //       _id: "",
    //     },
    //   }

    //   delete order.user._id
    //   delete order.hostId
    //   return order
    // })
    return orders
  } catch (err) {
    logger.error("cannot find orders", err)
  }
}

async function remove(orderId) {
  try {
    const store = asyncLocalStorage.getStore()
    const { loggedinUser } = store
    const collection = await dbService.getCollection("order")
    // remove only if user is owner/admin
    const criteria = { _id: ObjectId(orderId) }
    if (!loggedinUser.isAdmin) criteria.byUserId = ObjectId(loggedinUser._id)
    const { deletedCount } = await collection.deleteOne(criteria)
    return deletedCount
  } catch (err) {
    logger.error(`cannot remove order ${orderId}`, err)
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
  remove,
}

// {
//   "_id": "62e01b0f817bb215608f42f5",
//   "startDate": "2022-01-06",
//   "endDate": "2022-01-07",
//   "guests": 6,
//   "aboutStay": {
//   " _id": "62dfab59d687d9bed9fdf779",
//   "name": "M&M Space MM2 Apartamento no centro da cidade",
//   "price": 65,
//   "guestDetails": {
//   "_id": "1234",
//   "fullname": "Vlad Putin"
//   }
//   },
//   "toHost": {
//   "id": "78704763",
//   "fullname": "Maria"
//   },
//   "status": "pending"
//   },
//   {
//   "_id": "62e01b0f817bb215608f42f6",
//   "startDate": "2022-01-06",
//   "endDate": "2022-01-07",
//   "guests": 6,
//   "aboutStay": {
//   "_id": "62dfab59d687d9bed9fdf77b",
//   "name": "Habitación centro de Barcelona",
//   "price": 40,
//   "guestDetails": {
//   "_id": "12345",
//   "fullname": "sharon cohen"
//   }
//   },
//   "toHost": {
//   "fullname": "Marian",
//   "_id": "31635864"
//   },
//   "status": "pending"
//   },
//   {
//   "_id": "62dfab59d687d9bed9fdf77d",
//   "startDate": "2022-01-06",
//   "endDate": "2022-01-07",
//   "guests": 4,
//   "aboutStay": {
//   "_id": 1324,
//   "name": "Home, Sweet, Harlem. Welcome!",
//   "price": 110,
//   "guestDetails": {
//   "_id": "61b064aedcbbeca56bcf1738",
//   "fullname": "Vladi putin"
//   }
//   },
//   "toHost": {
//   " _id": "6543",
//   "fullname": "Kevin"
//   },
//   "status": "pending"
//   }
//   ]
// {
//   "checkin": "2022-01-06",
//     "checkout": "2022-01-07",
//       "guests": 6,
//         "Stay": {
//     "stayId": "62dfab59d687d9bed9fdf779",
//       "name": "M&M Space MM2 Apartamento no centro da cidade",
//         "price": 65,
//           "guestDetails": {
//       "guestId": "1234",
//         "fullname": "Vlad Putin"
//     }
//   },
//   "host": {
//     "hostId": "78704763",
//       "hostName": "Maria"
//   },
//   "status": "pending"
// }

// {
// "checkin": "2022-01-06",
// "checkout": "2022-01-07",
// "guests": 6,
// "stay": {
// "stayId": "62dfab59d687d9bed9fdf77b",
// "name": "Habitación centro de Barcelona",
// "price": 40,
// "guestDetails": {
// "guestId": "12345",
// "guestName": "sharon cohen"
// }
// },
// "host": {
// "hostName": "Marian",
// "hostId": "31635864"
// },
// "status": "pending"
// }

// {
// "checkin": "2022-01-06",
// "checkout": "2022-01-07",
// "guests": 4,
// "stay": {
// "stayId": 1324,
// "name": "Home, Sweet, Harlem. Welcome!",
// "price": 110,
// "guestDetails": {
// "guestId": "61b064aedcbbeca56bcf1738",
// "guestName": "Vladi putin"
// }
// },
// "host": {
// "hostId": "6543",
// "hostName": "Kevin"
// },
// "status": "pending"
// }
