export interface ImageData {
  width: number;
  height: number;
  data: ArrayLike<number>;
}

export type HashMethod = 1 | 2;

const median = (data: number[]): number => {
  const mdarr = data.slice(0).sort((a, b) => a - b);
  if (mdarr.length % 2 === 0) {
    return (mdarr[mdarr.length / 2] + mdarr[mdarr.length / 2 + 1]) / 2.0;
  }
  return mdarr[Math.floor(mdarr.length / 2)];
};

const translateBlocksToBits = (blocks: number[], pixelsPerBlock: number): void => {
  const newblocks = blocks;
  const halfBlockValue = (pixelsPerBlock * 256 * 3) / 2;
  const bandsize = blocks.length / 4;

  // Compare medians across four horizontal bands
  for (let i = 0; i < 4; i += 1) {
    const m = median(blocks.slice(i * bandsize, (i + 1) * bandsize));
    for (let j = i * bandsize; j < (i + 1) * bandsize; j += 1) {
      const v = blocks[j];
      // Output a 1 if the block is brighter than the median.
      // With images dominated by black or white, the median may
      // end up being 0 or the max value, and thus having a lot
      // of blocks of value equal to the median.  To avoid
      // generating hashes of all zeros or ones, in that case output
      // 0 if the median is in the lower value space, 1 otherwise
      newblocks[j] = Number(
        v > m || (Math.abs(v - m) < 1 && m > halfBlockValue),
      );
    }
  }
};

const bitsToHexhash = (bitsArray: number[]): string => {
  const hex: string[] = [];
  for (let i = 0; i < bitsArray.length; i += 4) {
    const nibble = bitsArray.slice(i, i + 4);
    hex.push(parseInt(nibble.join(''), 2).toString(16));
  }

  return hex.join('');
};

const pixelValue = (data: ImageData, index: number): number => {
  const alpha = data.data[index + 3];
  if (alpha === 0) {
    return 765;
  }
  return data.data[index] + data.data[index + 1] + data.data[index + 2];
};

const bmvbhashEven = (data: ImageData, bits: number): string => {
  const blocksizeX = Math.floor(data.width / bits);
  const blocksizeY = Math.floor(data.height / bits);

  const result: number[] = [];

  for (let y = 0; y < bits; y += 1) {
    for (let x = 0; x < bits; x += 1) {
      let total = 0;

      for (let iy = 0; iy < blocksizeY; iy += 1) {
        for (let ix = 0; ix < blocksizeX; ix += 1) {
          const cx = x * blocksizeX + ix;
          const cy = y * blocksizeY + iy;
          total += pixelValue(data, (cy * data.width + cx) * 4);
        }
      }

      result.push(total);
    }
  }

  translateBlocksToBits(result, blocksizeX * blocksizeY);
  return bitsToHexhash(result);
};

const bmvbhash = (data: ImageData, bits: number): string => {
  const evenX = data.width % bits === 0;
  const evenY = data.height % bits === 0;

  if (evenX && evenY) {
    return bmvbhashEven(data, bits);
  }

  // initialize blocks array with 0s
  const blocks = Array.from({ length: bits }, () => new Array<number>(bits).fill(0));

  const blockWidth = data.width / bits;
  const blockHeight = data.height / bits;

  for (let y = 0; y < data.height; y += 1) {
    let weightTop: number;
    let weightBottom: number;
    let blockTop: number;
    let blockBottom: number;

    if (evenY) {
      // don't bother dividing y, if the size evenly divides by bits
      blockBottom = Math.floor(y / blockHeight);
      blockTop = blockBottom;
      weightTop = 1;
      weightBottom = 0;
    } else {
      const yMod = (y + 1) % blockHeight;
      const yFrac = yMod - Math.floor(yMod);
      const yInt = yMod - yFrac;

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
      const avgvalue = pixelValue(data, (y * data.width + x) * 4);
      let weightLeft: number;
      let weightRight: number;
      let blockLeft: number;
      let blockRight: number;

      if (evenX) {
        blockRight = Math.floor(x / blockWidth);
        blockLeft = blockRight;
        weightLeft = 1;
        weightRight = 0;
      } else {
        const xMod = (x + 1) % blockWidth;
        const xFrac = xMod - Math.floor(xMod);
        const xInt = xMod - xFrac;

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
      blocks[blockTop][blockLeft] += avgvalue * weightTop * weightLeft;
      blocks[blockTop][blockRight] += avgvalue * weightTop * weightRight;
      blocks[blockBottom][blockLeft] += avgvalue * weightBottom * weightLeft;
      blocks[blockBottom][blockRight] += avgvalue * weightBottom * weightRight;
    }
  }

  const result = blocks.flat();

  translateBlocksToBits(result, blockWidth * blockHeight);
  return bitsToHexhash(result);
};

export default (imgData: ImageData, bits: number, method: HashMethod): string => {
  if (method === 1) {
    return bmvbhashEven(imgData, bits);
  }
  if (method === 2) {
    return bmvbhash(imgData, bits);
  }
  throw new Error('Bad hashing method');
};
