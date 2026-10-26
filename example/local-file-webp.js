import path from 'node:path';
import { imageHash } from 'image-hash';

const hash = await imageHash(path.join(import.meta.dirname, 'Example.webp'), 16, true);
console.log(hash);
