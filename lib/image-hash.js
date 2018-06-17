const fs = require('fs');
const fileType = require('file-type');
const jpeg = require('jpeg-js');
const blockhash = require('./block-hash');
const request = require('request');

module.exports = (src, bits, method, cb) => {

  const checkFileType = (name, data) => {
    //what is the image type
    if (name.lastIndexOf('.') > 0) {
      const ext = name.split(/\#|\?/)[0].split('.').pop().trim().toLowerCase();
      if (ext === 'png') {

      } else if (ext === 'jpg' || ext === 'jpeg') {
        // console.log(data);
        data = jpeg.decode(data);
        data = blockhash(data, bits, method?2:1);
        cb(null, data);
      } else {
        cb(new Error('Unrecognized file extension'));
      }
    } else {
      cb(new Error('Cannot find file extension'));
    }
  };

  const handleRequest = (err, res, body) => {
    if (err) {
      return cb(err);
    }

    const mimeType = fileType(res.body).mime;
    if (mimeType !== 'image/jpeg') {
      return cb(`Request returned bad mimeType: "${mimeType}"`);
    }

    checkFileType(res.request.uri.href, res.body);
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

