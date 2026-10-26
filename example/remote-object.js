import { imageHash } from 'image-hash';

const hash = await imageHash({
  url: 'https://ichef-1.bbci.co.uk/news/660/cpsprodpb/7F76/production/_95703623_mediaitem95703620.jpg',
  headers: { 'user-agent': 'image-hash-example' },
  signal: AbortSignal.timeout(10_000),
}, 16, true);
console.log(hash);
