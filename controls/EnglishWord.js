const createWord = require('../utils/createWords')

module.exports = {
  // 发送题目
  WordRequest (req, res) {
    res.json({
      code: 200,
      msg: 'ok',
      data: createWord()
    })
  }
}
