const {writePushPop, writeArithmetic} = require('./code-writer')

const reg1 = /(\/\/).+/
const reg2 = /^(\/\/)/
const regPush = /^(push)/
const regPop = /^(pop)/

function parser(commands, fileName) {
  let output = ''
  while (hasMoreCommands(commands)) {
    let command = commands.shift().trim()
    if (isValidCommand(command)) {
      output += advance(command, fileName)
    }
  }
  return output
}

function advance(command, fileName) {
  let output
  command = command.replace(reg1, '').trim()
  const type = commandType(command)
  switch (type) {
    case 'push':
    case 'pop':
      output = writePushPop(command, type, fileName)
      break;
    case "arith":
      output = writeArithmetic(command)
      break
  }
  return output
}

function hasMoreCommands(commands) {
  return commands.length > 0
}

function isValidCommand(command) {
  if (command === '' || reg2.test(command)) {
    return false
  }
  return true
}

function commandType(command) {
  if (regPush.test(command)) {
    return 'push'
  } else if(regPop.test(command)){
    return 'pop'
  } else {
    return 'arith'
  }
}

module.exports = {
  parser
}