const mysql = require('mysql');
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'shanannan521',
  database: 'EnglishGame'
})
const query = function( sql, values ) {
  return new Promise(( resolve, reject ) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        reject( err )
      } else {
        connection.query(sql, values, ( err, rows) => {
          if ( err ) {
            reject( err )
          } else {
            resolve( rows )
          }
          connection.release()
        })
      }
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