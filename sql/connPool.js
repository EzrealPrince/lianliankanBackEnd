let mysql = require('mysql');
let db = require('./db');
let pool = mysql.createPool(db);
module.exports = {
        connPool (sql, val) {
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
}

