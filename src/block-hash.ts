import { ImageData as JpegImageData } from 'jpeg-js';
import { PNGWithMetadata } from 'pngjs';

type Data = PNGWithMetadata | JpegImageData | ReturnType<typeof import('@cwasm/webp')['decode']>;

const median = (data: number[]) => {
  const array = data.slice(0).sort((a, b) => a - b);
  if (array.length % 2 === 0) return (array[array.length / 2] + array[array.length / 2 + 1]) / 2.0;
  return array[Math.floor(array.length / 2)];
};

const translateBlocksToBits = (blocks: number[], pixelsPerBlock: number) => {
  const newBlocks = blocks;
  const halfBlockValue = (pixelsPerBlock * 256 * 3) / 2;
  const bandSize = blocks.length / 4;

  // Compare medians across four horizontal bands
  for (let i = 0; i < 4; i += 1) {
    const m = median(blocks.slice(i * bandSize, (i + 1) * bandSize));
    for (let j = i * bandSize; j < (i + 1) * bandSize; j += 1) {
      const v = blocks[j];
      // Output a 1 if the block is brighter than the median.
      // With images dominated by black or white, the median may
      // end up being 0 or the max value, and thus having a lot
      // of blocks of value equal to the median.  To avoid
      // generating hashes of all zeros or ones, in that case output
      // 0 if the median is in the lower value space, 1 otherwise
      newBlocks[j] = Number(
        v > m || (Math.abs(v - m) < 1 && m > halfBlockValue),
      );
    }
  }
};

const bitsToHexHash = (bitsArray: number[]) => {
  const hex = [];
  for (let i = 0; i < bitsArray.length; i += 4) {
    const nibble = bitsArray.slice(i, i + 4);
    hex.push(parseInt(nibble.join(''), 2).toString(16));
  }

  return hex.join('');
};

const bmvbHashEven = (data: Data, bits: number) => {
  const blocksizeX = Math.floor(data.width / bits);
  const blocksizeY = Math.floor(data.height / bits);

  const result = [];

  for (let y = 0; y < bits; y += 1) {
    for (let x = 0; x < bits; x += 1) {
      let total = 0;

      for (let iy = 0; iy < blocksizeY; iy += 1) {
        for (let ix = 0; ix < blocksizeX; ix += 1) {
          const cx = x * blocksizeX + ix;
          const cy = y * blocksizeY + iy;
          const ii = (cy * data.width + cx) * 4;

          const alpha = data.data[ii + 3];
          if (alpha === 0) {
            total += 765;
          } else {
            total += data.data[ii] + data.data[ii + 1] + data.data[ii + 2];
          }
        }
      }

      result.push(total);
    }
  }

  translateBlocksToBits(result, blocksizeX * blocksizeY);
  return bitsToHexHash(result);
};

const bmvbHash = (data: Data, bits: number) => {
  const result = [];
  let weightTop: number;
  let weightBottom: number;
  let weightLeft: number;
  let weightRight: number;
  let blockTop: number;
  let blockBottom: number;
  let blockLeft: number;
  let blockRight: number;
  let yMod: number;
  let yFrac: number;
  let yInt: number;
  let xMod: number;
  let xFrac: number;
  let xInt: number;
  const blocks = [];

  const evenX = data.width % bits === 0;
  const evenY = data.height % bits === 0;

  if (evenX && evenY) {
    return bmvbHashEven(data, bits);
  }

  // initialize blocks array with 0s
  for (let i = 0; i < bits; i += 1) {
    blocks.push([]);
    for (let j = 0; j < bits; j += 1) {
      blocks[i].push(0);
    }
  }

  const blockWidth = data.width / bits;
  const blockHeight = data.height / bits;

  for (let y = 0; y < data.height; y += 1) {
    if (evenY) {
      // don't bother dividing y, if the size evenly divides by bits
      blockBottom = Math.floor(y / blockHeight);
      blockTop = blockBottom;
      weightTop = 1;
      weightBottom = 0;
    } else {
      yMod = (y + 1) % blockHeight;
      yFrac = yMod - Math.floor(yMod);
      yInt = yMod - yFrac;

      weightTop = 1 - yFrac;
      weightBottom = yFrac;

      // y_int will be 0 on bottom/right borders and on block boundaries
      if (yInt > 0 || y + 1 === data.height) {
        blockBottom = Math.floor(y / blockHeight);
        blockTop = blockBottom;
      } else {
        blockTop = Math.floor(y / blockHeight);
        blockBottom = Math.ceil(y / blockHeight);
      }
    }

    for (let x = 0; x < data.width; x += 1) {
      let averageValue: number;
      const ii = (y * data.width + x) * 4;
      const alpha = data.data[ii + 3];
      if (alpha === 0) {
        averageValue = 765;
      } else {
        averageValue = data.data[ii] + data.data[ii + 1] + data.data[ii + 2];
      }

      if (evenX) {
        blockRight = Math.floor(x / blockWidth);
        blockLeft = blockRight;
        weightLeft = 1;
        weightRight = 0;
      } else {
        xMod = (x + 1) % blockWidth;
        xFrac = xMod - Math.floor(xMod);
        xInt = xMod - xFrac;

        weightLeft = 1 - xFrac;
        weightRight = xFrac;

        // x_int will be 0 on bottom/right borders and on block boundaries
        if (xInt > 0 || x + 1 === data.width) {
          blockRight = Math.floor(x / blockWidth);
          blockLeft = blockRight;
        } else {
          blockLeft = Math.floor(x / blockWidth);
          blockRight = Math.ceil(x / blockWidth);
        }
      }

      // add weighted pixel value to relevant blocks
      blocks[blockTop][blockLeft] += averageValue * weightTop * weightLeft;
      blocks[blockTop][blockRight] += averageValue * weightTop * weightRight;
      blocks[blockBottom][blockLeft] += averageValue * weightBottom * weightLeft;
      blocks[blockBottom][blockRight] += averageValue * weightBottom * weightRight;
    }
  }

  for (let i = 0; i < bits; i += 1) {
    for (let j = 0; j < bits; j += 1) {
      result.push(blocks[i][j]);
    }
  }

  translateBlocksToBits(result, blockWidth * blockHeight);
  return bitsToHexHash(result);
};

export default (imgData: Data, bits: number, method: 1 | 2) => {
  if (method === 1) return bmvbHashEven(imgData, bits);
  if (method === 2) return bmvbHash(imgData, bits);

  throw new Error('Bad hashing method');
};
