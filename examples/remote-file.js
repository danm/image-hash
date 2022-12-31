const { imageHash } = require('../dist');

imageHash('https://ichef-1.bbci.co.uk/news/660/cpsprodpb/7F76/production/_95703623_mediaitem95703620.jpg', 16, false).then(res => {
  console.log(res);
});
