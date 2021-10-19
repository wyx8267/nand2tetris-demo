const fs = require('fs')
const CompilationEngine = require('./compilation')
const JackTokenizer = require('./tokenizer')


const fileName = process.argv[2]

const isDirectory = fs.lstatSync(fileName).isDirectory()

if (isDirectory) {
  fs.readdir(fileName, (err, files) => {
    if (err) {
      throw err
    }
    files.forEach(file => {
      let tempArr = file.split('.')
      if (tempArr.pop() == 'jack') {
        let preName = tempArr.join('.')
        let data = fs.readFileSync(`${fileName}/${file}`, 'utf-8')
        processFileData(data, `${fileName}/${preName}`)
      }
    })
  })
} else {
  let tempArr = fileName.split('.')
  if (tempArr.pop() == 'jack') {
    let preName = tempArr.join('.')
    outputFileName = preName
    let data = fs.readFileSync(fileName, 'utf-8')
    processFileData(data, preName)
  }
}

function processFileData(data, path) {
  data = data.split('\r\n')
  const tokens = new JackTokenizer(data, path).getTokens()
  new CompilationEngine(tokens, path)
}