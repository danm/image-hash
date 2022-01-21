import fs from 'fs';
import { Buffer } from 'buffer';
import fileType from 'file-type';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';
import request from 'request';
import { URL } from 'url';
import blockhash from './block-hash';
import webp from '@cwasm/webp';

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

export interface UrlRequestObject {
  encoding?: string | null,
  url: string | null,
}

export interface BufferObject {
  ext?: string,
  data: Buffer,
  name?: string
}
// eslint-disable-next-line
export const imageHash = (oldSrc: string | UrlRequestObject | BufferObject, bits, method, cb) => {
  const src = oldSrc;

  const getFileType = async (data: Buffer | string) => {
    if (typeof src !== 'string' && isBufferObject(src) && src.ext) {
      return {
        mime: src.ext,
      };
    }
    try {
      if (Buffer.isBuffer(data)) {
        return await fileType.fromBuffer(data);
      }
      if (typeof src === 'string') {
        return await fileType.fromFile(src);
      }
      return '';
    } catch (err) {
      throw err;
    }
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
          cb(new Error(`Unrecognized file extension, mime type or mismatch, ext: ${ext} / mime: ${type}`));
        }
      } else {
        console.warn('No file extension found, attempting mime typing.');
        if (type.mime === 'image/png') {
          processPNG(data, bits, method, cb);
        } else if (type.mime === 'image/jpeg') {
          processJPG(data, bits, method, cb);
        } else if (type.mime === 'image/webp') {
          processWebp(data, bits, method, cb);
        } else {
          cb(new Error(`Unrecognized mime type: ${type}`));
        }
      }
    }).catch((err) => {
      cb(err);
    });
  };

  const handleRequest = (err, res) => {
    if (err) {
      cb(new Error(err));
    } else {
      const url = new URL(res.request.uri.href);
      const name = url.pathname;
      checkFileType(name, res.body);
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
    const req = {
      url: src,
      encoding: null,
    };
    request(req, handleRequest);
  } else if (typeof src !== 'string' && isBufferObject(src)) {
    // image buffers
    checkFileType(src.name, src.data);
  } else if (typeof src !== 'string' && isUrlRequestObject(src)) {
    // Request Object
    src.encoding = null;
    request(src, handleRequest);
  } else {
    // file
    fs.readFile(src, handleReadFile);
  }
};
