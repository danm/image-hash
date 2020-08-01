import fs from 'fs';
import { Buffer } from 'buffer';
import fileType from 'file-type';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';
import request from 'request';
import { URL } from 'url';
import blockhash from './block-hash';

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

interface UrlRequestObject {
  encoding?: string | null,
  url: string | null,
}

interface Base64Object {
  encoding?: string | null,
  data: string | null
}

// eslint-disable-next-line
export const imageHash = (oldSrc: string | UrlRequestObject | Base64Object | Buffer, bits, method, cb) => {
  const src = oldSrc;

  const isBase64Object = (obj: Base64Object | UrlRequestObject): obj is Base64Object => {
    const casted = (obj as Base64Object);
    return casted.data && casted.encoding && casted.encoding === 'base64';
  };

  const isUrlRequestObject = (obj: Base64Object | UrlRequestObject): obj is UrlRequestObject => {
    const casted = (obj as UrlRequestObject);
    return casted.url && casted.url.length > 0;
  };

  const checkFileType = (name, data) => {
    // what is the image type
    const type = fileType(data);
    console.log(type);
    console.log(data);
    if (!type || !type.mime) {
      cb(new Error('Mime type not found'));
      return;
    }
    if (name.lastIndexOf('.') > 0) {
      const ext = name
        .split('.')
        .pop()
        .toLowerCase();
      if (ext === 'png' && type.mime === 'image/png') {
        processPNG(data, bits, method, cb);
      } else if ((ext === 'jpg' || ext === 'jpeg') && type.mime === 'image/jpeg') {
        processJPG(data, bits, method, cb);
      } else {
        cb(new Error(`Unrecognized file extension, mime type or mismatch, ext: ${ext} / mime: ${type.mime}`));
      }
    } else {
      console.warn('No file extension found, attempting mime typing.');
      if (type.mime === 'image/png') {
        processPNG(data, bits, method, cb);
      } else if (type.mime === 'image/jpeg') {
        processJPG(data, bits, method, cb);
      } else {
        cb(new Error(`Unrecognized mime type: ${type.mime}`));
      }
    }
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
  } else if (Buffer.isBuffer(src)) {
    // image buffers
    checkFileType('input-img', src);
  } else if (typeof src !== 'string' && isBase64Object(src)) {
    // Base64 Object
    const buffer = new Buffer(src.data, 'base64');
    checkFileType('', buffer);
  } else if (typeof src !== 'string' && isUrlRequestObject(src)) {
    // Request Object
    src.encoding = null;
    request(src, handleRequest);
  } else {
    // file
    fs.readFile(src, handleReadFile);
  }
};
