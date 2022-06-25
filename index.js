function isString(val) {
  return Object.prototype.toString.call(val) === "[object String]";
}

// testing
// console.log('is string: ', isString('xxx'));

module.exports = {
  isString,
};
