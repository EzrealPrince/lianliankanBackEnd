const express = require('express')
const fs = require('fs')
const app = express()
const https = require('https')
const http = require('http')
const bodyParser = require('body-parser')
const router = require('./router')
const createWords = require('./utils/createWords')
const bookClass = require('./constant/courseClass')
app.use(bodyParser.json())
app.use(router)

app.get('/', (req, res) => {
  res.json(createWords())
})

app.post('/login', (req, res) => {
    console.log(req.body)
    const appid = 'wxa8d49de007172665'
    const appSerect = '2806f42dbad885ea4284a8441c1ddfc5'
    const reqUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${appSerect}&js_code=${req.body.code}&grant_type=authorization_code`
    https.get(reqUrl,(wxres) => {
        wxres.on('data', (d) => {
            process.stdout.write(d)
            res.json({
                data: JSON.parse(d.toString()),
                msg: '请求成功',
                code: 200
            })
        });
    })
})

fs.readFile('./success.json', 'utf8', (err, data) => {
  if (err) throw err
  global.allBooks = JSON.parse(data)
})
const options = {
  key: fs.readFileSync('./keys/ezreal-key.pem'),
  cert: fs.readFileSync('./keys/ezreal-cert.pem')
};
const server = https.createServer(options, app);
server.listen(443,function () { console.log("https server is running on port 443");});


var socket = require('ws').Server
wss = new socket({ port: 8000 });

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState == 1) {
      client.send(data)
    }
  })
}

const rooms = { }
for(let i = 0; i < 10;i++) {
    rooms[i] = []
    let initRoomId = i * 10000
    for(let j = 0; j < 20; j++) {
        let single  = {
            roomId: initRoomId + j,
            roomStatus: 0,
            roomAccounts: [],
            userInfoList: []
        }
        rooms[i].push(single)
    }
}
wss.on('connection',(ws, req) => {
  // 获取IP地址
  const ip = req.connection.remoteAddress
  console.log('新连接进来的ip地址为: ', ip)
  ws.on('message', req => {
    req = JSON.parse(req)
    let roomRank,tempRooms,tempRoom,roomId,dataWord,res,currentRooms
    switch(req.method) {
      case 'waitGameFriend':
          console.log('好友对战等待中')
          currentRooms = rooms[9]
          for(let i = 0; i < currentRooms.length; i++) {
              if(currentRooms[i].roomStatus === 0) {
                  currentRooms[i].roomAccounts.push(ws)
                  currentRooms[i].userInfoList.push(req.userInfo)
                  currentRooms[i].roomStatus = 1
                  tempRoom = currentRooms[i]
                  break
              }
          }
          res = {
              method: 'waitGameFriend',
              roomId: tempRoom.roomId
          }
          ws.send(JSON.stringify(res))
          break
      case 'friendGameStart':
          tempRooms = rooms[9]
          tempRoom = tempRooms.find(item => item.roomId == req.roomId)
          dataWord = createWords(req.bookId)
          res = {
              method: 'friendGameStart',
              data: dataWord
          }
         tempRoom.roomAccounts.forEach(item => item.send(JSON.stringify(res)))
         break
      case 'friendJoin':
          console.log('好友对战roomId = ',req.roomId)
          tempRooms = rooms[9]
          console.log(tempRooms)
          tempRoom = tempRooms.find(item => item.roomId == req.roomId)
          console.log('tempRoom = ',tempRoom)
          tempRoom.roomStatus = 2
          tempRoom.roomAccounts.push(ws)
          tempRoom.userInfoList.push(req.userInfo)
          res = {
              method: 'friendJoin',
              userInfo: tempRoom.userInfoList

          }
          tempRoom.roomAccounts.forEach(item => item.send(JSON.stringify(res)))
          break
      case 'waitGame':
        console.log('当前等级为: ' , req.level)
        currentRooms = rooms[parseInt(req.level / 10)] || rooms[8]  // 查找到当前段位的所有房间
        let findRoomFlag = false
        for(let i = 0; i < currentRooms.length; i++) {
          if(currentRooms[i].roomStatus === 1) {  // 找到一个正在等待的房间
            currentRooms[i].roomAccounts.push(ws)
            console.log(req.userInfo)
            currentRooms[i].userInfoList.push(req.userInfo)
            currentRooms[i].roomStatus = 2
            console.log('已经准备开始游戏,正在进行发题')
            dataWord
            let books = bookClass[parseInt(req.level / 20)].content || bookClass[4]
            let randomIndex = parseInt(books.length * Math.random())
            dataWord = createWords(books[randomIndex].bookId)
            res= {method: 'gameStart', roomId:currentRooms[i].roomId, data: dataWord, userInfo: currentRooms[i].userInfoList}
            currentRooms[i].roomAccounts.forEach(item => item.send(JSON.stringify(res)))
            findRoomFlag = true
            break
          }
        }
        if(!findRoomFlag) { // 如果没找到合适的房间
          for(let i = 0; i < currentRooms.length; i++) {
            if(currentRooms[i].roomStatus === 0) {  // 找到一个空的房间
              currentRooms[i].roomAccounts.push(ws)
              currentRooms[i].userInfoList.push(req.userInfo)
              currentRooms[i].roomStatus = 1
              console.log('正在等待其他人加入')
              break
            }
          }
        }
        console.log('正在进行: waitGame')
        break
      case 'killWord':
        console.log('正在进行: killWord','当前房间号为:',req.roomId)
        roomRank = req.roomId.toString()[0]
        tempRooms = rooms[roomRank] || rooms[8]
        console.log(tempRooms)
        tempRoom = tempRooms.find(item => item.roomId === req.roomId)
        console.log('tempRoom = ',tempRoom)
        tempRoom.roomAccounts.forEach(ws => ws.send(JSON.stringify(req)))
        break
      case 'updateScore':
        console.log('正在进行: uodateScore')
        wss.broadcast(JSON.stringify(req))
        break
      case 'singleGame':
        console.log('正在惊醒: singleGame')
        res = {method: 'gameStart', data: createWord() }
        wss.send(JSON.stringify(res))
        break
      case 'gameOver':
        roomId = req.roomId
        roomRank = req.roomId.toString()[0]
        tempRooms = rooms[roomRank] || rooms[8]
        tempRoom = tempRooms.find(item => item.roomId === req.roomId)
        tempRoom.roomAccounts.forEach(ws => ws.send(JSON.stringify(req)))
        for(let i = 0; i < tempRooms.length;i++) {
          if(tempRooms[i].roomId === roomId) {
            tempRooms[i] = {
              roomId: roomId,
              roomStatus: 0,
              roomAccounts: [],
              userInfoList: []
            }
          }
        }
        break
      default:
        break
    }
  })
})
