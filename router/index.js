const EnglishWord = require('../controls/EnglishWord');
const user = require('../controls/user')
const express = require('express')
const api = require('../api');
const router = express.Router();

//EnglishWord
router.post(api.WordRequest, EnglishWord.WordRequest);
// user
router.post(api.userRequest, user.userRequest);
router.post(api.userLevelChanged, user.userLevelChanged);
module.exports = router;
