const express = require('express')
const { 
    requireAuth,
    requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const {
    addOrder,
    getOrders,
    getOrder,
    updateOrder
} = require('./order.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getOrders)
router.post('/', log, addOrder)
router.put('/:id?', log, updateOrder)
router.get('/:id', log, getOrder)
// router.get('/', log, requireAuth, getOrders)
// router.post('/', log, requireAuth, addOrder)
// router.delete('/:id', requireAuth, deleteReview)



module.exports = router