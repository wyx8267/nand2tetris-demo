const table = {
  SP: 0,
  LCL: 1,
  ARG: 2,
  THIS: 3,
  THAT: 4,
  SCREEN: 16384,
  KBD: 24576
}

let ramAddress = 16;
let num = 16;
let key;
while (num--) {
  key = `R${num}`;
  table[key] = num
}

function addEntry(symbol, address) {
  table[symbol] = address;
}

function contains(symbol) {
  return table[symbol] !== undefined;
}

function getAddress(symbol) {
  return table[symbol]
}

module.exports = {
  table,
  ramAddress,
  addEntry,
  contains,
  getAddress
}