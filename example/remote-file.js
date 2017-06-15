const imageHash = require('../index');

imageHash('https://ichef-1.bbci.co.uk/news/660/cpsprodpb/7F76/production/_95703623_mediaitem95703620.jpg', 16, false, (err, res) => {
  if (err) throw err;
  console.log(res);
});