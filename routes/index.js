const express = require('express')
const router = express.Router()

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({
    msg: '测试'
  })
})

router.get('/rooms', function(req, res, next) {
  res.json(res.roomsInfo)
})

module.exports = router
