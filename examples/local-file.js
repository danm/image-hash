const { resolve } = require('path');
const { imageHash } = require('../dist');

imageHash(resolve(__dirname, './assets/_95695590_tv039055678.jpg'), 16, true).then(res => {
  console.log(res);
});