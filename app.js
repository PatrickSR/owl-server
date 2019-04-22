const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')

const indexRouter = require('./routes/index')

const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

// 全部房间的信息
const roomsInfo = {

}

const FUNCTIONTYPE = '[object Function]'
const OBJECTTYPE = '[object Object]'
const STRINGTYPE = '[object String]'
function type(obj) {
  return Object.prototype.toString.call(obj)
}

function printMessage(message, roomId) {
  switch (type(message)) {
    case OBJECTTYPE:
      console.log(`
      收到请求内容： ${JSON.stringify(message)}
      房间号：${roomId}
      -----------------------------------`)
      break;
    case STRINGTYPE: 
      console.log(`
      收到请求内容： ${message}
      房间号：${roomId}
      -----------------------------------`)
      break
    default:
      console.warn(`
      收到请求内容： ${JSON.stringify(message)}
      房间号：${roomId}
      -----------------------------------`)
      break;
  }
}

app.use(cors({
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}))
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(function(req, res, next){
  res.io = io
  res.roomsInfo = roomsInfo
  next()
})

app.use('/', indexRouter)

io.on('connection', function(socket){
  const roomId = socket.handshake.query.roomId
  const from = socket.handshake.query.from

  if(!roomsInfo[roomId]){
    roomsInfo[roomId] = {}
  }

  roomsInfo[roomId][from] = 1

  socket.join(roomId, () => {
    io.to(roomId).emit('notification', {
      message: `${from}加入房间成功`,
      type: 'console'
    })
  })

  socket.on('request', payload => {

    printMessage(payload.message, roomId)
    io.to(roomId).emit('notification', payload)    
  })

  socket.on('disconnect', () => {
    delete roomsInfo[roomId][from]
    if(Object.keys(roomsInfo[roomId]).length == 0){
      delete roomsInfo[roomId]
    }
  })
})

module.exports = {
  app,
  server
}
