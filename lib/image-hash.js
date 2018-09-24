const fs = require('fs');
const fileType = require('file-type');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');
const request = require('request');
const blockhash = require('./block-hash');

module.exports = (src, bits, method, cb) => {
  const checkFileType = (name, data) => {
    // what is the image type
    const mimeType = fileType(data).mime;
    if (name.lastIndexOf('.') > 0) {
      const ext = name.split('.').pop().toLowerCase();
      if (ext === 'png') {
        if (mimeType !== 'image/png') {
          cb(new Error(`Mime type mismatch. Expected image/png got "${mimeType}"`));
          return;
        }
        try {
          const png = PNG.sync.read(data);
          const res = blockhash(png, bits, method ? 2 : 1);
          cb(null, res);
        } catch (e) {
          cb(e);
        }
      } else if (ext === 'jpg' || ext === 'jpeg') {
        if (mimeType !== 'image/jpeg') {
          cb(new Error(`Mime type mismatch. Expected image/jpeg got "${mimeType}"`));
          return;
        }
        try {
          const decoded = jpeg.decode(data);
          const res = blockhash(decoded, bits, method ? 2 : 1);
          cb(null, res);
        } catch (e) {
          cb(e);
        }
      } else {
        cb(new Error('Unrecognized file extension'));
      }
    } else {
      cb(new Error('Cannot find file extension'));
    }
  };

  const handleRequest = (err, res) => {
    if (err) {
      cb(err);
    } else {
      checkFileType(res.request.uri.href, res.body);
    }
  };

  const handleReadFile = (err, res) => {
    if (err) {
      cb(err);
    } else {
      checkFileType(src, res); 
    }
  };

  //check source
  //is source assigned  
  if (src === undefined || src === undefined) {
    cb(new Error('No image source provided'));
  }

  //is src url or file
  if (typeof(src) === 'string' && src.indexOf('http') === 0) {
    //url
    let req = {
      url: src,
      encoding: null
    };

    request(req, handleRequest);

  } else if (typeof(src) === 'object') {
    //Request Object
    src.encoding = null;
    request(src, handleRequest);
  } else {
    //file
    fs.readFile(src, handleReadFile);
  }

};
