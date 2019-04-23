function canGo(matrix, point1, point2) {
  console.log(point1, point2)
  if(matrix[point1.x][point1.y] !== -1 && matrix[point2.x][point2.y] !== -1 && !(point1.x === point2.x && point1.y === point2.y) && (matrix[point1.x][point1.y] === matrix[point2.x][point2.y])) {
    return true
  }
  return false
}
function sameRowEmpty(matrix, point1, point2) {
  if(point1.y > point2.y) {
    for(let i = point2.y + 1; i < point1.y; i++) {
      if(matrix[point1.x][i] !== -1) return false
    }
  } else {
    for(let i = point1.y + 1; i < point2.y; i++) {
      if(matrix[point1.x][i] !== -1) return false
    }
  }
  return true
}

function sameLineEmpty(matrix, point1, point2) {
  if(point1.x > point2.x) {
    for(let i = point2.x + 1; i < point1.x; i++) {
      if(matrix[i][point1.y] !== -1) {
        return false 
      }
    }
  } else {
    for(let i = point1.x + 1; i < point2.x; i++) {
      if(matrix[i][point1.y] !== -1) return false
    }
  }
  return true
}

// 是否在同一列且可消除
function isSameLine(matrix, point1, point2) {
  if((point1.y === point2.y && (point1.y === 0 || point1.y === 3))) {
    console.log('边缘列消除')
    return true
  }
  return point1.y === point2.y && sameLineEmpty(matrix, point1, point2)
}

// 是否在同一行且可消除
function isSameRow(matrix, point1, point2) {
  if(point1.x === point2.x && (point1.x === 0 || point1.x === 4)) {
    console.log('边缘行消除')
    return true
  }
  return point1.x === point2.x && sameRowEmpty(matrix, point1, point2)
}

// 拐一次
function isTurnOnce(matrix, point1, point2) {
  let tempPointY = {...point1}
  tempPointY.y = point2.y
  let tempPointX = {...point1}
  tempPointX.x = point2.x
  console.log(point1, point2, tempPointX, tempPointY)
  let result = false
  matrix[tempPointY.x][tempPointY.y] === -1 && sameRowEmpty(matrix, point2, tempPointY) && isSameLine(matrix, point1, tempPointY) && (result = true)
  matrix[tempPointX.x][tempPointX.y] === -1 && sameRowEmpty(matrix, point1, tempPointX) && isSameLine(matrix, point2, tempPointX) && (result = true)
  console.log('result = ',result)
  return result
}

// 拐两次
function isTurnTwice(matrix, point1, point2) {
  // 从当前点向右扫描
  console.log('向右扫描')
  for(let i = point1.x + 1; i < 4; i++) {
    if(matrix[i][point1.y] === -1) {
      if(isTurnOnce(matrix, {x: i, y: point1.y}, point2)) return true
    } else {
      break
    }
  }
  // 向左
  console.log('向左扫描')
  for(let i = point1.y - 1; i >= 0; i--) {  
    if(matrix[point1.x][i] === -1) {
      if(isTurnOnce(matrix, {x: point1.x, y: i}, point2)) return true
    } else {
      break
    }
  }
  // 向上扫描
  console.log('向上扫描')
  for(let i = point1.y + 1; i < 5; i++) {
    if(matrix[point1.x][i] === -1) {
      if(isTurnOnce(matrix, {x: point1.x, y: i}, point2)) return true
    } else {
      break
    }
  }
  console.log('向下扫描')
  for(let i = point1.y - 1; i >= 0; i--) {
    if(matrix[point1.x][i] === -1) {
      if(isTurnOnce(matrix, {x: point1.x, y: i}, point2)) return true
    } else {
      break
    }
  }
  return false
}
function isTowPointClear(matrix, point1, point2) {
  //console.log("检查同一行",point1, point2)
  if(isSameRow(matrix, point1, point2)) {
    console.log('同一行消除',point1,point2)
    return true
  }
  //console.log("检查同一列")
  if(isSameLine(matrix, point1, point2)) {
    console.log('同一列消除',point1,point2)
    return true
  }
  //console.log("检查一拐")
  if(isTurnOnce(matrix, point1, point2)) {
    console.log('一拐消除',point1,point2)
    return true
  }
  //console.log("检查二拐")
  if(isTurnTwice(matrix, point1, point2)) {
    console.log('二拐消除',point1,point2)
    return true
  }
  return false
}
let flag = false
exports.isClearable = function isClearable(matrix) {  // 
  for(let i = 0; i < matrix.length; i++) {
    for(let j = 0; j < matrix[i].length; j++) {
      for(let i1 = 0; i1 < matrix.length; i1++) {
        for(let j1 = 0; j1 < matrix[i1].length; j1++) {
          if(canGo(matrix, {x: i, y: j}, {x: i1, y: j1})) {
            if(isTowPointClear(matrix, {x: i, y: j}, {x: i1, y: j1})) {
              matrix[i][j] = -1
              matrix[i1][j1] = -1
              console.log(matrix)
              flag = true
              break
            }
          }         
        }
      }
    }
  }
  if(matrix.every(item => item.every(childItem => childItem === -1))) return true
  if(flag && !matrix.every(item => item.every(childItem => childItem === -1))) {
    console.log("flag = ", flag)
    flag = false
    isClearable(matrix)
  } else if(!flag){
    return false
  }

}
// const matrix =  
//   [ [ 2, 16, 19, 2 ],
//   [ 4, 4, 10, 7 ],
//   [ 9, 9, 10, 11 ],
//   [ 12, 13, 7, 12 ],
//   [ 16, 11, 13, 19 ] ]

// isClearable(matrix)