const fs = require('fs')
const { parser } = require('./parser')

const fileName = process.argv[2]

const isDirectory = fs.lstatSync(fileName).isDirectory()

let outputFileName, assembleOut = ''

if (isDirectory) {
  outputFileName = fileName
  fs.readdir(fileName, (err, files) => {
    if (err) {
      throw err
    }
    files.forEach(file => {
      let tempArr = file.split('.')
      if (tempArr.pop() == 'vm') {
        let preName = tempArr.join('.')
        let data = fs.readFileSync(`${fileName}/${file}`, 'utf-8')
        processFileData(data, preName)
      }
    })
    setFileName()
  })
} else {
  let tempArr = fileName.split('.')
  tempArr.pop()
  let preName = tempArr.join('.')
  outputFileName = preName
  let data = fs.readFileSync(fileName, 'utf-8')
  processFileData(data, preName)
  setFileName()
}

function processFileData(data, preName) {
  data = data.split('\r\n')
  assembleOut += parser(data, preName)
}

function setFileName() {
  fs.writeFile(outputFileName + '.asm', assembleOut, (err) => {
    if (err) {
      throw err
    }
  })
}