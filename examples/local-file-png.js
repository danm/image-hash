const { resolve } = require('path');
const { imageHash } = require('../dist');

imageHash(resolve(__dirname, './assets/piggy.png'), 16, true).then(res => {
  console.log(res);
});