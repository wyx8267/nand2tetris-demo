const {
  writePushPop,
  writeArithmetic,
  writeInit,
  writeLabel,
  writeGoto,
  writeIf,
  writeCall,
  writeReturn,
  writeFunction,
} = require("./code-writer");

const reg1 = /(\/\/).+/;
const reg2 = /^(\/\/)/;

function parser(commands, fileName) {
  let output = "";
  while (hasMoreCommands(commands)) {
    let command = commands.shift().trim();
    if (isValidCommand(command)) {
      output += advance(command, fileName);
    }
  }
  return output;
}

function advance(command, fileName) {
  let output;
  command = command.replace(reg1, "").trim();
  const type = commandType(command);
  switch (type) {
    case "push":
    case "pop":
      output = writePushPop(command, type, fileName);
      break;
    case "arith":
      output = writeArithmetic(command);
      break;
    case "label":
      output = writeLabel(command, type, fileName);
      break;
    case "goto":
      output = writeGoto(command, type, fileName);
      break;
    case "if":
      output = writeIf(command, type, fileName);
      break;
    case "return":
      output = writeReturn(command);
      break;
    case "function":
      output = writeFunction(command, type);
      break;
    case "call":
      output = writeCall(command, type);
      break;
  }
  return output;
}

function hasMoreCommands(commands) {
  return commands.length > 0;
}

function isValidCommand(command) {
  if (command === "" || reg2.test(command)) {
    return false;
  }
  return true;
}

const regPush = /^(push)/;
const regPop = /^(pop)/;
const regLabel = /^(label)/;
const regGoto = /^(goto)/;
const regIfGoto = /^(if-goto)/;
const regReturn = /^(return)/;
const regFunction = /^(function)/;
const regCall = /^(call)/;
const types = ['add', 'sub', 'neg', 'eq', 'gt', 'lt', 'and', 'or', 'not']
function commandType(command) {
  if (regPush.test(command)) {
    return "push";
  } else if (regPop.test(command)) {
    return "pop";
  } else if (regLabel.test(command)) {
    return "label";
  } else if (regGoto.test(command)) {
    return "goto";
  } else if (regIfGoto.test(command)) {
    return "if";
  } else if (regReturn.test(command)) {
    return "return";
  } else if (regFunction.test(command)) {
    return "function";
  } else if (regCall.test(command)) {
    return "call";
  } else if(types.includes(command)) {
    return "arith";
  }
}

module.exports = {
  parser,
};
