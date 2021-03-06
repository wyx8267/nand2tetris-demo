const types = ["add", "sub", "neg", "eq", "gt", "lt", "and", "or", "not"];
let index = 0;
const output1 = "@SP\r\n" + "AM=M-1\r\n" + "D=M\r\n" + "A=A-1\r\n";
const output2 = "@SP\r\n" + "AM=M-1\r\n";
const output3 = "@SP\r\n" + "M=M+1\r\n";

function writeInit() {
  let output = "@256\r\n" + "D=A\r\n" + "@SP\r\n" + "M=D\r\n";

  output += writeCall("call Sys.init 0", "call");
  return output;
}

function writeArithmetic(command) {
  if (types.includes(command)) {
    let output;

    switch (command) {
      case "add":
        output = output1 + "M=M+D\r\n";
        break;
      case "sub":
        output = output1 + "M=M-D\r\n";
        break;
      case "neg":
        output = output2 + "M=-M\r\n" + output3;
        break;
      case "eq":
        output = createJudgementString("JEQ", index++);
        break;
      case "gt":
        output = createJudgementString("JGT", index++);
        break;
      case "lt":
        output = createJudgementString("JLT", index++);
        break;
      case "and":
        output = output1 + "M=M&D\r\n";
        break;
      case "or":
        output = output1 + "M=M|D\r\n";
        break;
      case "not":
        output = output2 + "M=!M\r\n" + output3;
        break;
    }
    return output;
  }
}

function writePushPop(command, type, fileName) {
  let v1 = arg1(command, type).toUpperCase();
  let v2 = arg2(command, type);
  return processSegment(v1, v2, type, fileName);
}

function writeLabel(command) {
  let label = command.split(" ").pop();
  let output = "(" + label + ")\r\n";

  return output;
}

function writeGoto(command) {
  let label = command.split(" ").pop();
  let output = "@" + label + "\r\n" + "0;JMP\r\n";

  return output;
}

function writeIf(command) {
  let label = command.split(" ").pop();
  let output =
    "@SP\r\n" + "AM=M-1\r\n" + "D=M\r\n" + "@" + label + "\r\n" + "D;JNE\r\n";

  return output;
}

let callIndex = -1;
const callArry = ["LCL", "ARG", "THIS", "THAT"];
function writeCall(command, type) {
  callIndex++;
  let funcName = arg1(command).toUpperCase();
  let argumentNum = arg2(command, type);
  let output =
    "@" +
    funcName +
    "RETURN_ADDRESS" +
    callIndex +
    "\r\n" +
    "D=A\r\n" +
    "@SP\r\n" +
    "A=M\r\n" +
    "M=D\r\n" +
    "@SP\r\n" +
    "M=M+1\r\n";

  callArry.forEach((symbol) => {
    output +=
      "@" +
      symbol +
      "\r\n" +
      "D=M\r\n" +
      "@SP\r\n" +
      "A=M\r\n" +
      "M=D\r\n" +
      "@SP\r\n" +
      "M=M+1\r\n";
  });

  output +=
    "@" +
    argumentNum +
    "\r\n" +
    "D=A\r\n" +
    "@5\r\n" +
    "D=D+A\r\n" +
    "@SP\r\n" +
    "D=M-D\r\n" +
    "@ARG\r\n" +
    "M=D\r\n" +
    "@SP\r\n" +
    "D=M\r\n" +
    "@LCL\r\n" +
    "M=D\r\n" +
    "@" +
    funcName +
    "\r\n" +
    "0;JMP\r\n" +
    "(" +
    funcName +
    "RETURN_ADDRESS" +
    callIndex +
    ")\r\n";

  return output;
}

const pointerArry = ["THAT", "THIS", "ARG", "LCL"];
function writeReturn(command) {
  let str = "";
  pointerArry.forEach((symbol) => {
    str +=
      "@R13\r\n" +
      "D=M-1\r\n" +
      "AM=D\r\n" +
      "D=M\r\n" +
      "@" +
      symbol +
      "\r\n" +
      "M=D\r\n";
  });

  let output =
    "@LCL\r\n" +
    "D=M\r\n" +
    "@R13\r\n" +
    "M=D\r\n" +
    "@5\r\n" +
    "A=D-A\r\n" +
    "D=M\r\n" +
    "@R14\r\n" + // ??????????????????
    "M=D\r\n" +
    "@SP\r\n" +
    "AM=M-1\r\n" +
    "D=M\r\n" +
    "@ARG\r\n" +
    "A=M\r\n" +
    "M=D\r\n" +
    "@ARG\r\n" +
    "D=M+1\r\n" +
    "@SP\r\n" +
    "M=D\r\n" +
    str +
    "@R14\r\n" +
    "A=M\r\n" +
    "0;JMP\r\n";

  return output;
}

function writeFunction(command, type) {
  let funcName = arg1(command).toUpperCase();
  let localNum = arg2(command, type);
  let output = "(" + funcName + ")\r\n";

  while (localNum--) {
    output += writePushPop("push constant 0", "push");
  }

  return output;
}

function processSegment(v1, v2, type, fileName) {
  let output;
  switch (v1) {
    case "CONSTANT":
      output =
        "@" +
        v2 +
        "\r\n" +
        "D=A\r\n" +
        "@SP\r\n" +
        "A=M\r\n" +
        "M=D\r\n" +
        "@SP\r\n" +
        "M=M+1\r\n";
      break;
    case "STATIC":
      if (type == "push") {
        output =
          "@" +
          fileName +
          "." +
          v2 +
          "\r\n" +
          "D=M\r\n" +
          "@SP\r\n" +
          "A=M\r\n" +
          "M=D\r\n" +
          "@SP\r\n" +
          "M=M+1\r\n";
      } else {
        output =
          "@SP\r\n" +
          "AM=M-1\r\n" +
          "D=M\r\n" +
          "@" +
          fileName +
          "." +
          v2 +
          "\r\n" +
          "M=D\r\n";
      }
      break;
    case "POINTER":
      if (v2 == 0) {
        v1 = "THIS";
      } else if (v2 == 1) {
        v1 = "THAT";
      }

      if (type == "push") {
        output =
          "@" +
          v1 +
          "\r\n" +
          "D=M\r\n" +
          "@SP\r\n" +
          "A=M\r\n" +
          "M=D\r\n" +
          "@SP\r\n" +
          "M=M+1\r\n";
      } else {
        output =
          "@" +
          v1 +
          "\r\n" +
          "D=A\r\n" +
          "@R13\r\n" +
          "M=D\r\n" +
          "@SP\r\n" +
          "AM=M-1\r\n" +
          "D=M\r\n" +
          "@R13\r\n" +
          "A=M\r\n" +
          "M=D\r\n";
      }
      break;
    case "TEMP":
      if (type == "push") {
        output = pushTemplate("@R5\r\n", v2, false);
      } else {
        output = popTemplate("@R5\r\n", v2, false);
      }

      break;
    default:
      let str;
      if (v1 == "LOCAL") {
        str = "@LCL\r\n";
      } else if (v1 == "ARGUMENT") {
        str = "@ARG\r\n";
      } else {
        str = "@" + v1 + "\r\n";
      }

      if (type == "push") {
        output = pushTemplate(str, v2, true);
      } else {
        output = popTemplate(str, v2, true);
      }
  }
  return output;
}

function arg1(command, type) {
  if (type == "arith") {
    return command;
  } else {
    const tempArr = command.split(" ").slice(1);
    let arg = tempArr.shift();
    while (arg === "") {
      arg = tempArr.shift();
    }
    return arg;
  }
}

const arg2Arr = ["push", "pop", "function", "call"];
function arg2(command, type) {
  if (arg2Arr.includes(type)) {
    return command.split(" ").pop();
  }
}

function createJudgementString(judge, index) {
  // ????????????????????? ????????????????????? ?????? ?????? ?????? ?????????
  // ???????????????????????????????????? ????????????????????????????????????symbol?????????
  let str =
    "@SP\r\n" +
    "AM=M-1\r\n" +
    "D=M\r\n" +
    "A=A-1\r\n" +
    "D=M-D\r\n" +
    "@TRUE" +
    index +
    "\r\n" + // ???????????????????????? ????????????symbol1???????????????
    "D;" +
    judge +
    "\r\n" + // ????????????????????????
    "@SP\r\n" +
    "AM=M-1\r\n" +
    "M=0\r\n" +
    "@SP\r\n" +
    "M=M+1\r\n" +
    "@CONTINUE" +
    index +
    "\r\n" +
    "0;JMP\r\n" +
    "(TRUE" +
    index +
    ")\r\n" +
    "@SP\r\n" +
    "AM=M-1\r\n" +
    "M=-1\r\n" +
    "@SP\r\n" +
    "M=M+1\r\n" +
    "(CONTINUE" +
    index +
    ")\r\n";
  return str;
}

function popTemplate(str, v2, flag) {
  let str1 = flag ? "D=M\r\n" : "D=A\r\n";
  let output =
    str +
    str1 +
    "@" +
    v2 +
    "\r\n" +
    "D=D+A\r\n" +
    "@R13\r\n" +
    "M=D\r\n" +
    "@SP\r\n" +
    "AM=M-1\r\n" +
    "D=M\r\n" +
    "@R13\r\n" +
    "A=M\r\n" +
    "M=D\r\n";

  return output;
}

function pushTemplate(str, v2, flag) {
  let str1 = flag ? "D=M\r\n" : "D=A\r\n";
  let output =
    str +
    str1 +
    "@" +
    v2 +
    "\r\n" +
    "A=D+A\r\n" +
    "D=M\r\n" +
    "@SP\r\n" +
    "A=M\r\n" +
    "M=D\r\n" +
    "@SP\r\n" +
    "M=M+1\r\n";

  return output;
}

module.exports = {
  writePushPop,
  writeArithmetic,
  writeInit,
  writeLabel,
  writeGoto,
  writeIf,
  writeCall,
  writeReturn,
  writeFunction,
};
