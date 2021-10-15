const { addEntry, contains, getAddress } = require("./symbol-table");
let { ramAddress } = require("./symbol-table");
const { dest, comp, jump } = require("./code");

const reg1 = /^\((.+)\)$/; // 提取地址变量名
const reg2 = /^(\/\/)/; // 匹配开头注释
const reg3 = /(\/\/).+/; // 匹配指令后注释
let pc = -1;

function parser(instructions, isFirst) {
  return advance(instructions, isFirst);
}

function hasMoreCommands(instructions) {
  return instructions.length > 0;
}

function advance(instructions, isFirst) {
  let curInstruction,
    type,
    binaryOut = "";
  while (hasMoreCommands(instructions)) {
    curInstruction = instructions.shift().trim();

    if (isInstructionInvalid(curInstruction)) {
      continue;
    }

    // 删除指令右边注释
    curInstruction = curInstruction.replace(reg3, "").trim();
    type = commandType(curInstruction);

    switch (type) {
      case "C":
        if (!isFirst) {
          let d = dest(curInstruction);
          let c = comp(curInstruction);
          let j = jump(curInstruction);
          binaryOut += "111" + c + d + j + "\r\n";
        } else {
          pc++;
        }
        break;
      case "A":
        if (!isFirst) {
          let token = symbol(curInstruction, type);
          let binary;
          if (isNaN(parseInt(token))) {
            if (contains(token)) {
              binary = int2Binary(getAddress(token));
            } else {
              binary = int2Binary(ramAddress);
              addEntry(token, ramAddress++);
            }
          } else {
            binary = int2Binary(token);
          }
          binaryOut += binary + '\r\n';
        } else {
          pc++;
        }
        break;
      case "L":
        if (isFirst) {
          let token = symbol(curInstruction, type);
          addEntry(token, pc + 1);
        }
        break;
    }
  }
  return binaryOut;
}

function isInstructionInvalid(instruction) {
  if (instruction == "" || reg2.test(instruction)) {
    return true;
  }
  return false;
}

function commandType(instruction) {
  if (instruction.charAt(0) === "@") {
    return "A";
  } else if (instruction.charAt(0) === "(") {
    return "L";
  } else {
    return "C";
  }
}

function symbol(instruction, type) {
  if (type === "A") {
    return instruction.substr(1);
  } else if (type === "L") {
    return instruction.replace(reg1, "$1");
  }
}

function int2Binary(num) {
  let str = parseInt(num).toString(2);
  while (str.length < 16) {
    str = "0" + str;
  }
  return str;
}

module.exports = parser;
