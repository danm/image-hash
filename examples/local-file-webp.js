const { resolve } = require('path');
const { imageHash } = require('../dist');

imageHash(resolve(__dirname, './assets/Example.webp'), 16, true).then(res => {
  console.log(res);
});