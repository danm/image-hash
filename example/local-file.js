import path from 'node:path';
import { imageHash } from 'image-hash';

const hash = await imageHash(path.join(import.meta.dirname, '_95695590_tv039055678.jpg'), 16, true);
console.log(hash);
