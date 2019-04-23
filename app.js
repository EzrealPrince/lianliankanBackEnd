const express = require('express')
const fs = require('fs')
const app = express()
const https = require('https')
const http = require('http')
const bodyParser = require('body-parser')
const router = require('./router')
const createWords = require('./utils/createWords')
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
  global.AllWords = JSON.parse(data).book[0].AllWord
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

const rooms = {
  1: [    // 青铜
    {
        roomId: 10001,
        roomStatus: 0,
        roomAccounts: []
    }, {
        roomId: 10002,
        roomStatus: 0,
        roomAccoutns: []
    }
  ],
  2: [  // 白银
    {
      roomId: 20001,
      roomStatus: 0,
      roomAccounts: []
    }, {
        roomId: 20002,
        roomStatus: 0,
        roomAccounts: []
    }
  ],
  3: [  // 黄金
    {
      roomId: 30001,
      roomStatus: 0,
      roomAccounts: []
    }, {
        roomId: 30002,
        roomStatus: 0,
        roomAccounts: []
    }
  ],
  other: [  // 其他段位
    {
      roomId: 100001,
      roomStatus: 0,
      roomAccounts: []
    }, {
        roomId: 100002,
        roomStatus: 0,
        roomAccounts: []
    }
  ],
}
const ipPools = {}
let gamer = 0
wss.on('connection',(ws, req) => {
  // 获取IP地址
  const ip = req.connection.remoteAddress
  console.log('新连接进来的ip地址为: ', ip)
  ws.on('message', req => {
    req = JSON.parse(req)
    let res
    switch(req.method) {
      case 'waitGame':
        console.log('当前等级为: ' , req.level)
        const currentRooms = rooms[req.level / 10] || rooms.other  // 查找到当前段位的所有房间
        let findRoomFlag = false
        for(let i = 0; i < currentRooms.length; i++) {
          if(currentRooms[i].roomStatus === 1) {  // 找到一个正在等待的房间
            currentRooms[i].roomAccounts.push(ws)
            console.log('已经准备开始游戏,正在进行发题')
            let res= {method: 'gameStart', roomId:currentRooms[i].roomId, data: createWords()}
            currentRooms[i].roomAccounts.forEach(ws => ws.send(JSON.stringify(res)))
            findRoomFlag = true
            break
          }
        }
        if(!findRoomFlag) { // 如果没找到合适的房间
          for(let i = 0; i < currentRooms.length; i++) {
            if(currentRooms[i].roomStatus === 0) {  // 找到一个空的房间
              currentRooms[i].roomAccounts.push(ws)
              console.log('正在等待其他人加入')
              break
            }
          }
        }
        console.log('正在进行: waitGame')
        break
      case 'killWord':
        console.log('正在进行: killWord','当前房间号为:',req.roomId)
        const roomRank = req.roomId.toString()[0]
        let tempRooms = rooms[roomRank] || rooms.other
        tempRooms.forEach(ws => ws.send(JSON.stringify(res)))
        break
      case 'updateScore':
        console.log('正在进行: uodateScore')
        wss.broadcast(JSON.stringify(res))
        break
      case 'singleGame':
        console.log('正在惊醒: singleGame')
        res = {method: 'gameStart', data: createWord() }
        wss.send(JSON.stringify(res))
        break
      case 'gameOver':
        gamer = 0
        res = { method: 'gameOver', score: {} }
        res = JSON.stringify(res)
        break
      default:
        break
    }
  })
})
