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

const rooms = [
    {
        roomId: 10001,
        roomStatus: 0,
        roomAcoounts: []
    }, {
        roomId: 10002,
        roomStatus: 0,
        roomAccoutns: []
    }
]
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
        rooms.forEach(item => {
            if(item.roomStatus === 1) {
                item.roomAccounts.push(ws)
                console.log('正在进行发题')
                let res= {method: 'gameStart', roomId:item.roomId, data: createWords()}
                item.roomAccounts.forEach(ws => ws.send(JSON.stringify(res)))
            }
        })
        console.log('正在进行: waitGame')
        if(++gamer === 2) {
          console.log('正在进行发题')
          let res = { method: 'gameStart', data: createWords() }
          res = JSON.stringify(res)
          wss.broadcast(res)
        }
        break
      case 'killWord':
        console.log('正在进行: killWord')
        wss.broadcast(JSON.stringify(res))
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
