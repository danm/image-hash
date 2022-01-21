const { imageHash } = require('../');

imageHash('./Example.webp', 16, true, (err, res) => {
  if (err) throw err;
  console.log(res);
});
