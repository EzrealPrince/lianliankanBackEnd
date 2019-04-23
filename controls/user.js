const mysql = require('mysql');
const db = require('../sql/db');
const pool = mysql.createPool(db);
function query (sql, val) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      err && reject('数据库连接失败')
      conn.query(sql, val, (err, rows) => {
        if (err) {
          reject(err)
        }
        resolve(rows)
         conn.release()
      })
    })
  })
}
module.exports = {
  userRequest(req, res) {
    const openId = req.body.openId
    const sql = `select * from userList where openId = ?`
    const arr = [openId]
    query(sql,arr)
      .then(data => {
        if(data.length > 0) {
          res.json({
              code: 200,
              msg: '登录成功',
              data: data
          })
        } else {
          const addSql = `insert into userList (open_id, level) value (?, 10)`
          query(addSql,arr)
            .then(data => {
              console.log(data)
              res.json({
                code: 200,
                msg: '未注册',
                data
              })
            },err => {
              console.log(err)
            })
        }
      })
  },
  userLevelChanged(req, res) {
    const {openId, winFlag} = req.body
    const sql = `select * from userList where openId = ?`
    const arr = [openId]
    query(sql,arr)
      .then(data => {
        const newLevel = data.level + winFlag
        const newSql =  `update userList set level = ? where open_id= ?`
        const newArr = [newLevel,openId]
        return query(newSql, newArr)
      })
      .then(data => {
        res.json({
          code: 200,
          msg: '修改等级成功',
          data: data
        })
      }) 
  }
}