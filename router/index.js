const EnglishWord = require('../controls/EnglishWord');
const user = require('../controls/user')
const wrongWord = require('../controls/wrongWord')
const express = require('express')
const api = require('../api');
const router = express.Router();

//EnglishWord
router.post(api.WordRequest, EnglishWord.WordRequest);

// user
router.post(api.userRequest, user.userRequest);
router.post(api.userLevelChanged, user.userLevelChanged);
// WrongWordAdd
router.post(api.wrongWordAdd, wrongWord.addWrongWord);
router.post(api.wrongWordRequest, wrongWord.wrongWordRequest);
router.post(api.wrongWordDelete, wrongWord.wrongWordDelete);
module.exports = router;
