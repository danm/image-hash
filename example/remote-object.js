const imageHash = require('../index');

const config = {
  uri: 'https://ichef-1.bbci.co.uk/news/660/cpsprodpb/7F76/production/_95703623_mediaitem95703620.jpg'
};

imageHash(config, 16, true, (err, res) => {
  if (err) throw err;
  console.log(res);
});