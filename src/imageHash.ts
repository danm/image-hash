import fs from 'fs';
import { Buffer } from 'buffer';
import fileType from 'file-type';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';
import got from 'got';
import { URL } from 'url';
import webp from '@cwasm/webp';
import blockhash from './block-hash';

export interface UrlRequestObject {
  encoding?: string | null,
  url: string | null,
}

export interface BufferObject {
  ext?: string,
  data: Buffer,
  name?: string
}

const processPNG = (data, bits, method) => {
  const png = PNG.sync.read(data);
  return blockhash(png, bits, method ? 2 : 1);
};

const processJPG = (data, bits, method) => {
  const decoded = jpeg.decode(data);
  return blockhash(decoded, bits, method ? 2 : 1);
};

const processWebp = (data, bits, method) => {
  const decoded = webp.decode(data);
  return blockhash(decoded, bits, method ? 2 : 1);
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
export default async function imageHash(oldSrc: string | UrlRequestObject | BufferObject, bits, method) {
  const src = oldSrc;

  const getFileType = (data: Buffer | string) => {
    if (typeof src !== 'string' && isBufferObject(src) && src.ext) {
      return {
        mime: src.ext,
      };
    }
    if (Buffer.isBuffer(data)) {
      return fileType.fromBuffer(data);
    }
    if (typeof src === 'string') {
      return fileType.fromFile(src);
    }
    return '';
  };

  const checkFileType = async (name, data: Buffer | string) => {
    const type = await getFileType(data);
    if (!type) throw new Error('Mime type not found');
    if (name && name.lastIndexOf('.') > 0) {
      const ext = name
        .split('.')
        .pop()
        .toLowerCase();
      if (ext === 'png' && type.mime === 'image/png') {
        return processPNG(data, bits, method);
      } if ((ext === 'jpg' || ext === 'jpeg') && type.mime === 'image/jpeg') {
        return processJPG(data, bits, method);
      } if (ext === 'webp' && type.mime === 'image/webp') {
        return processWebp(data, bits, method);
      }
      throw new Error(`Unrecognized file extension, mime type or mismatch, ext: ${ext} / mime: ${type}`);
    } else {
      console.warn('No file extension found, attempting mime typing.');
      if (type.mime === 'image/png') {
        return processPNG(data, bits, method);
      } if (type.mime === 'image/jpeg') {
        return processJPG(data, bits, method);
      } if (type.mime === 'image/webp') {
        return processWebp(data, bits, method);
      }
      throw new Error(`Unrecognized mime type: ${type}`);
    }
  };

  const processResult = (res) => {
    const url = new URL(res.request.uri.href);
    const name = url.pathname;
    return checkFileType(name, res.body);
  };

  if (src === undefined) throw new Error('No image source provided');

  // is src url or file
  if (typeof src === 'string' && (src.indexOf('http') === 0 || src.indexOf('https') === 0)) {
    // url
    const req = {
      url: src,
      encoding: null,
    };
    const result = await got(req);
    return processResult(result);
  }
  if (typeof src !== 'string' && isBufferObject(src)) {
    // image buffers
    return checkFileType(src.name, src.data);
  }
  if (typeof src !== 'string' && isUrlRequestObject(src)) {
    // Request Object
    const req = {
      url: src.url,
      encoding: null,
    };
    const result = await got(req);
    return processResult(result);
  }
  const fileData = fs.readFileSync(src);
  return checkFileType(src, fileData);
}
