import { imageHash } from 'image-hash';

const hash = await imageHash('https://ichef-1.bbci.co.uk/news/660/cpsprodpb/7F76/production/_95703623_mediaitem95703620.jpg', 16, false);
console.log(hash);
