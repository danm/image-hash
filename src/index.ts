import fs from 'fs';
import { Buffer } from 'buffer';
import { fileTypeFromFile, fileTypeFromBuffer } from 'file-type';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';
import { URL } from 'url';
import webp from '@cwasm/webp';
import blockhash from './block-hash';

export interface UrlRequestObject {
  encoding?: string | null,
  url: string | null,
  [key: string]: unknown,
}

export interface BufferObject {
  ext?: string,
  data: Buffer,
  name?: string
}

const processPNG = (data, bits, method, cb) => {
  try {
    const png = PNG.sync.read(data);
    const res = blockhash(png, bits, method ? 2 : 1);
    cb(null, res);
  } catch (e) {
    cb(e);
  }
};

const processJPG = (data, bits, method, cb) => {
  try {
    const decoded = jpeg.decode(data);
    const res = blockhash(decoded, bits, method ? 2 : 1);
    cb(null, res);
  } catch (e) {
    cb(e);
  }
};

const processWebp = (data, bits, method, cb) => {
  try {
    const decoded = webp.decode(data);
    const res = blockhash(decoded, bits, method ? 2 : 1);
    cb(null, res);
  } catch (e) {
    cb(e);
  }
};

const isUrlRequestObject = (obj: UrlRequestObject | BufferObject): obj is UrlRequestObject => {
  const casted = (obj as UrlRequestObject);
  return casted.url && casted.url.length > 0;
};

const isBufferObject = (obj: UrlRequestObject | BufferObject): obj is BufferObject => {
  const casted = (obj as BufferObject);
  return Buffer.isBuffer(casted.data)
    || (Buffer.isBuffer(casted.data) && (casted.ext && casted.ext.length > 0));
};

// eslint-disable-next-line
export const imageHash = (oldSrc: string | UrlRequestObject | BufferObject, bits, method, cb) => {
  const src = oldSrc;

  const getFileType = async (data: Buffer | string) => {
    if (typeof src !== 'string' && isBufferObject(src) && src.ext) {
      return {
        mime: src.ext,
      };
    }
    if (Buffer.isBuffer(data)) {
      return fileTypeFromBuffer(data);
    }
    if (typeof src === 'string') {
      return fileTypeFromFile(src);
    }
    return '';
  };

  const checkFileType = (name, data: Buffer | string) => {
    getFileType(data).then((type) => {
      // what is the image type
      if (!type) {
        cb(new Error('Mime type not found'));
        return;
      }
      if (name && name.lastIndexOf('.') > 0) {
        const ext = name
          .split('.')
          .pop()
          .toLowerCase();
        if (ext === 'png' && type.mime === 'image/png') {
          processPNG(data, bits, method, cb);
        } else if ((ext === 'jpg' || ext === 'jpeg') && type.mime === 'image/jpeg') {
          processJPG(data, bits, method, cb);
        } else if (ext === 'webp' && type.mime === 'image/webp') {
          processWebp(data, bits, method, cb);
        } else {
          cb(new Error(`Unrecognized file extension, mime type or mismatch, ext: ${ext} / mime: ${type.mime}`));
        }
      } else {
        if (process.env.verbose) console.warn('No file extension found, attempting mime typing.');
        if (type.mime === 'image/png') {
          processPNG(data, bits, method, cb);
        } else if (type.mime === 'image/jpeg') {
          processJPG(data, bits, method, cb);
        } else if (type.mime === 'image/webp') {
          processWebp(data, bits, method, cb);
        } else {
          cb(new Error(`Unrecognized mime type: ${type.mime}`));
        }
      }
    }).catch((err) => {
      cb(err);
    });
  };

  const fetchRemoteImage = async (remoteSrc: string | UrlRequestObject) => {
    if (fetch && typeof fetch !== 'function') {
      cb(new Error('Global fetch API is not available. Node.js 18+ is required.'));
      return;
    }

    const requestUrl = typeof remoteSrc === 'string' ? remoteSrc : remoteSrc.url;

    if (!requestUrl) {
      cb(new Error('No URL provided for remote image.'));
      return;
    }

    let init: { [key: string]: unknown } | undefined;

    if (typeof remoteSrc !== 'string') {
      init = { ...remoteSrc };
      delete init.url;
      delete init.encoding;
    }

    try {
      const response = await fetch(requestUrl, init);
      if (!response || !response.ok) {
        const status = response ? `${response.status} ${response.statusText}` : 'Unknown status';
        throw new Error(`Failed to fetch image. HTTP status: ${status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      let pathname = '';
      try {
        const url = new URL(response.url || requestUrl);
        pathname = url.pathname;
      } catch (err) {
        pathname = '';
      }

      checkFileType(pathname, buffer);
    } catch (error) {
      cb(error);
    }
  };

  const handleReadFile = (err, res) => {
    if (err) {
      cb(new Error(err));
      return;
    }
    checkFileType(src, res);
  };

  // check source
  // is source assigned
  if (src === undefined) {
    cb(new Error('No image source provided'));
    return;
  }

  // is src url or file
  if (typeof src === 'string' && (src.indexOf('http') === 0 || src.indexOf('https') === 0)) {
    // url
    fetchRemoteImage(src);
  } else if (typeof src !== 'string' && isBufferObject(src)) {
    // image buffers
    checkFileType(src.name, src.data);
  } else if (typeof src !== 'string' && isUrlRequestObject(src)) {
    // Request Object
    fetchRemoteImage(src);
  } else {
    // file
    fs.readFile(src, handleReadFile);
  }
};
