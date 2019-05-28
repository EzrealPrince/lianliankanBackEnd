const createWord = require('../utils/createWords')

module.exports = {
  // 发送题目
  WordRequest (req, res) {
    const bookId = req.body.bookId
    console.log('请求的id为',bookId)
    res.json({
      code: 200,
      msg: 'ok',
      data: createWord(bookId)
    })
  }
}
