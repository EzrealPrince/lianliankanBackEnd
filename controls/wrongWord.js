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
  wrongWordRequest(req, res) {
    console.log('请求错题本')
    const openId = req.body.openId
    const sql = `select * from wrongWord where open_id = ?`
    const arr = [openId]
    query(sql, arr)
      .then(data => {
        res.json({
          msg: '查找成功',
          code: 200,
          data: data
        })
      })
  },
  addWrongWord(req, res) {
    console.log('请求添加错题')
    const {openId,wordId,wordDetails} = req.body
    let sql = `select * from wrongWord where open_id = ? and word_id = ?`
    let arr = [openId,wordId,wordDetails]
    query(sql,arr)
        .then(data => {
            if(data.length == 0) {
                sql = `insert into wrongWord (open_id,word_id,word_details) values (?,?,?)`
                arr = [openId,wordId,wordDetails]
                query(sql,arr)
                    .then(data => {
                        res.json({
                            code: 200,
                            msg: '添加错题成功',
                            data: data
                        })
                    })
            }
        })
  },
  wrongWordDelete(req, res) {
      console.log('请求删除错题')
      const {openId,wordId} = req.body
      const sql = `delete from wrongWord where open_id = ? and word_id = ?`
      const arr = [openId, wordId]
      query(sql, arr)
        .then(data => {
            res.json({
                code: 200,
                msg: '删除单词成功',
                data: data
            })
        })
    }
}
