const dbService = require("../../services/db.service")
const logger = require("../../services/logger.service")
const ObjectId = require("mongodb").ObjectId

async function query(filterBy = { dest: "", price: 0 }) {
  try {
    const collection = await dbService.getCollection("stay")
    var stays = await collection.find().toArray()

    if (!filterBy.dest && !filterBy.price) return stays
    var newStays = stays

    if (filterBy.dest) {
      const userInput = capitalizeFirstLetter(filterBy.dest)
      newStays = stays.filter((stay) => {
        return stay.loc.country.includes(userInput)
      })
      if (newStays.length === 0) return stays
    }

    if (filterBy.price) {
      newStays = stays.filter(
        (stay) => +filterBy.min < stay.price && +filterBy.max > stay.price
      )
    }
    if (filterBy.labels) {
      newStays = stays.filter((stay) => stay.labels === filterBy.labels)
    }

    const reviews = newStays.map((stay) => stay.reviews)
    reviews.filter((review) => {
      if (!review.by.imgUrl)
        return (
          review.by.imgUrl ===
          "https://xsgames.co/randomusers/avatar.php?g=male"
        )
      else return review.by.imgUrl
    })

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

function _buildCriteria(filterBy = { dest: "", guests: 0, dates: [] }) {
  const { dest, guests, dates } = filterBy
  // console.log(dest, "12345")
  const criteria = {}
  if (dest) criteria.dest = { $regex: dest, $options: "i" }
  // console.log(criteria, "123455")
  return criteria
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
