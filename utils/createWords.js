const judge = require('./judgeClear')

function createRandomIndex(len) {
  let result = []
  while(result.length < 10) {
    let index = ~~(Math.random() * len)
    result.includes(index) ? '' : result.push(index)
  }
  return result
}

function createResult(word) {
  let words = JSON.parse(JSON.stringify(word))
  let result = []
  let allIndex = []  // 0 - 20
  for(let i = 0; i < words.length * 2; i++) {
    allIndex.push(i)
  }
  while(allIndex.length > 0) {
    const index = ~~(Math.random() * allIndex.length)
    const realIndex = allIndex.splice(index,1)[0]
    const currentWord = words.pop()
    const singleEn = {
      label: currentWord.meanEn,
      key: realIndex,
      deleteFlag: false
    }
    result[realIndex] = singleEn
    const singleCn = {
      label: currentWord.meanCn,
      key: realIndex,
      deleteFlag: false
    }
    result[allIndex.splice(~~(Math.random() * allIndex.length),1)[0]] = singleCn
  }
  return result
}

function isSolved(words) {
  let matrix = [[], [], [], [], []]
  for(let i = 0; i < words.length; i++) {
    console.log(i, 'i / 4 = ', ~~(i / 4))
    matrix[~~(i / 4)].push(words[i].key)
  }
  return judge.isClearable(matrix)
}

module.exports = function createWords() {
  const wordsIndex = createRandomIndex(global.AllWords.length) 
  let result = []
  wordsIndex.forEach((item) => {
    const word = {}
    word.meanCn = global.AllWords[item].mean_cn
    word.meanEn = global.AllWords[item].word
    result.push(word)
  })
  // console.log(isSolved(createResult(result)))
  return createResult(result)
}