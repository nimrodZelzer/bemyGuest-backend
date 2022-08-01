const dbService = require("../../services/db.service")
const logger = require("../../services/logger.service")
const ObjectId = require("mongodb").ObjectId

async function query(filterBy = null) {
  try {
    const collection = await dbService.getCollection("stay")
    var stays = await collection.find().toArray()
    console.log('stay', this.stays);
    if (!filterBy || filterBy === {}) return stays
    var newStays = stays
    if (filterBy.txt) {
      newStays = newStays.filter((stay) =>
        filterBy.txt.toLowerCase().includes(stay.loc.country.toLowerCase()))
    }
    if (filterBy.price.min || filterBy.price.max) {
      newStays = newStays.filter(
        (stay) => +filterBy.min < stay.price && +filterBy.max > stay.price
      )
    }
    if (filterBy.label) {
      newStays = newStays.filter(
        (stay) => stay.labels[0] === filterBy.label
      )
    }
    return newStays
  } catch (err) {
    logger.error("cannot find stays", err)
    throw err
  }
}

async function getById(stayId) {
  try {
    const collection = await dbService.getCollection("stay")
    // console.log("collection: ", collection)
    var stay = collection.findOne({ _id: ObjectId(stayId) })
    return stay
  } catch (err) {
    logger.error(`while finding stay ${stayId}`, err)
    throw err
  }
}

async function remove(stayId) {
  try {
    const collection = await dbService.getCollection("stay")
    await collection.deleteOne({ _id: ObjectId(stayId) })

    return stayId
  } catch (err) {
    logger.error(`cannot remove stay ${stayId}`, err)
    throw err
  }
}

async function add(stay) {
  try {
    const collection = await dbService.getCollection("stay")
    const addedStay = await collection.insertOne(stay)
    const id = addedStay.insertedId.toString()
    stay._id = id
    // console.log('line47', stay)
    return stay
  } catch (err) {
    logger.error("cannot insert stay", err)
    throw err
  }
}
async function update(stay) {
  console.log(stay, "stayyyyyyyyyyyyyyyyyyyyyyy")
  try {
    var id = ObjectId(stay._id)
    delete stay._id
    const collection = await dbService.getCollection("stay")
    await collection.updateOne({ _id: id }, { $set: { ...stay } })
    return stay
  } catch (err) {
    logger.error(`cannot update stay ${id}`, err)
    throw err
  }
}

module.exports = {
  remove,
  query,
  getById,
  add,
  update,
}

function _buildCriteria(filterBy) {
  const criteria = {}
  const regex = new RegExp(filterBy.txt, "i")
  criteria.txt = { $regex: regex }

  return criteria
}
