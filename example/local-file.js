const imageHash = require('../index');

imageHash('./_95695590_tv039055678.jpg', 16, true, (err, res) => {
  if (err) throw err;
  console.log(res);
});