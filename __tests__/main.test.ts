import request from 'request';
import { expect } from 'chai';
import fs from 'fs';
import { imageHash } from '../src/';

describe('hash images', () => {
  it('should hash a local jpg', (done) => {
    imageHash('example/_95695590_tv039055678.jpg', 16, true, (err, res) => {
      expect(res).to.equal('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
      done();
    });
  });

  it('should hash a local jpg', (done) => {
    imageHash('example/_95695591_tv039055678.jpeg', 16, true, (err, res) => {
      expect(res).to.equal('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
      done();
    });
  });

  it('should hash a local png', (done) => {
    imageHash('example/Example.png', 16, true, (err, res) => {
      expect(res).to.equal('00007ffe7c3e780e601e603e7ffe7ffe47fe020642067ff66b066a567ffe7ffe');
      done();
    });
  });

  it('should hash a local PNG', (done) => {
    imageHash('example/Example2.PNG', 16, true, (err, res) => {
      expect(res).to.equal('00007ffe7c3e780e601e603e7ffe7ffe47fe020642067ff66b066a567ffe7ffe');
      done();
    });
  });

  it('should throw error when there is a mime type mismatch', (done) => {
    imageHash('example/jpgpretendingtobeapng.png', 16, true, (err) => {
      expect(err).instanceOf(Error);
      done();
    });
  });

  it('should throw an error when there is no src', (done) => {
    const undef = {};
    // @ts-ignore
    imageHash(undef.some, 16, true, (err) => {
      expect(err).instanceOf(Error);
      done();
    });
  });

  it('Should hash remote image', (done) => {
    imageHash('https://ichef.bbci.co.uk/news/800/cpsprodpb/145F4/production/_106744438_p077xzvx.jpg', 16, true, (err, res) => {
      if (err) {
        return done(err);
      }
      expect(res).to.equal('dfffbe3ff83fc03fc43ffc17bc07f803f00ff00ff00fe00ff05fe00fe00fe00f');
      return done();
    });
  });

  it('Should handle error when url is not found', (done) => {
    imageHash('https://ichef.bbo.co.uk/news/800/cpsprodpb/145F4/production/_106744438_p077xzvx.jpg', 16, true, (err) => {
      expect(err).instanceOf(Error);
      done();
    });
  });

  it('Should handle error when file is not found', (done) => {
    imageHash('example/jpgpreten.png', 16, true, (err) => {
      expect(err).instanceOf(Error);
      done();
    });
  });

  it('Should hash without jpg ext', (done) => {
    imageHash('example/Example', 16, true, (err, res) => {
      expect(res).to.equal('00007ffe7c3e780e601e603e7ffe7ffe47fe020642067ff66b066a567ffe7ffe');
      done();
    });
  });

  it('Should handle error when unreconised mime type', (done) => {
    imageHash('example/local-file-js', 16, true, (err) => {
      expect(err).instanceOf(Error);
      done();
    });
  });

  it('Should handle error when unreconised mime type', (done) => {
    imageHash('example/giphygif', 16, true, (err) => {
      expect(err).instanceOf(Error);
      done();
    });
  });

  it('Should handle jpg with no file extension', (done) => {
    imageHash('example/_95695592_tv039055678jpeg', 16, true, (err, res) => {
      expect(res).to.equal('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
      done();
    });
  });

  it('Should handle local jpg with file extension', (done) => {
    imageHash('example/_95695591_tv039055678.jpeg', 16, true, (err, res) => {
      expect(res).to.equal('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
      done();
    });
  });

  it('Should handle custom request object', (done) => {
    imageHash({
      url: 'https://ichef.bbci.co.uk/news/800/cpsprodpb/145F4/production/_106744438_p077xzvx.jpg',
    }, 16, true, (err, res) => {
      if (err) {
        return done(err);
      }
      expect(res).to.equal('dfffbe3ff83fc03fc43ffc17bc07f803f00ff00ff00fe00ff05fe00fe00fe00f');
      done(err);
    });
  });

  it('Should handle url when no extenion provided (#7)', (done) => {
    imageHash({
      url: 'https://falabella.scene7.com/is/image/Falabella/prod11830022_6',
    }, 16, true, (err, res) => {
      expect(res).to.equal('80ff807f807f807fcc7fc007c067c077c8f3c183c013ccf7c823c8f3f8f7f8ff');
      done();
    });
  });

  it('Should handle local file buffer', (done) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fs.readFile(`${__dirname}/../example/_95695591_tv039055678.jpeg`, (err, data) => {
      if (err) {
        return done(err);
      }
      imageHash({
        ext: 'image/jpeg',
        data,
      }, 16, true, (error, res) => {
        if (error) {
          return done(error);
        }
        expect(res).equal('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0').and.not.length(0);
        return done();
      });
    });
  });

  it('Should handle buffer with incorrect mime type', (done) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fs.readFile(`${__dirname}/../example/_95695591_tv039055678.jpeg`, (err, data) => {
      if (err) {
        return done(err);
      }
      imageHash({
        ext: 'image/jpg',
        data,
      }, 16, true, (error) => {
        expect(error).instanceOf(Error);
        return done();
      });
    });
  });

  it('Should handle local file buffer, without ext arg', (done) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fs.readFile(`${__dirname}/../example/_95695591_tv039055678.jpeg`, (err, data) => {
      if (err) {
        return done(err);
      }
      imageHash({
        data,
      }, 16, true, (error, res) => {
        if (error) {
          return done(error);
        }
        expect(res).equal('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0').and.not.length(0);
        return done();
      });
    });
  });

  it('Should handle remote file buffer', (done) => {
    try {
      const testUrl = 'https://ichef.bbci.co.uk/news/800/cpsprodpb/145F4/production/_106744438_p077xzvx.jpg';
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      request({ url: testUrl, encoding: null }, (err, _resp, buffer) => {
        if (err) {
          return done(err);
        }
        imageHash({
          ext: 'image/jpeg',
          data: buffer,
        }, 16, true, (imgErr, res) => {
          if (imgErr) {
            return done(err);
          }
          expect(res).not.length(0).and.equal('dfffbe3ff83fc03fc43ffc17bc07f803f00ff00ff00fe00ff05fe00fe00fe00f');
          return done();
        });
      });
    } catch (err) {
      return done(err);
    }
  });

  it('Should handle remote file buffer, without ext arg', (done) => {
    try {
      const testUrl = 'https://ichef.bbci.co.uk/news/800/cpsprodpb/145F4/production/_106744438_p077xzvx.jpg';
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      request({ url: testUrl, encoding: null }, (err, _resp, buffer) => {
        if (err) {
          return done(err);
        }
        imageHash({
          data: buffer,
        }, 16, true, (imgErr, res) => {
          if (imgErr) {
            return done(err);
          }
          expect(res).not.length(0).and.equal('dfffbe3ff83fc03fc43ffc17bc07f803f00ff00ff00fe00ff05fe00fe00fe00f');
          return done();
        });
      });
    } catch (err) {
      return done(err);
    }
  });
});
