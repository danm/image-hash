import { expect, describe, it } from 'vitest';
import fs from 'fs';
import { imageHash } from '../src/';

const fetchBuffer = async (url: string) => {
  if (typeof fetch !== 'function') {
    throw new Error('Global fetch API is not available. Node.js 18+ is required.');
  }

  const response = await fetch(url);

  if (!response || !response.ok) {
    const status = response ? `${response.status} ${response.statusText}` : 'Unknown status';
    throw new Error(`Failed to fetch image buffer. HTTP status: ${status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

describe('hash images', () => {
  it('should hash a local jpg', () => {
    return new Promise((resolve, reject) => {
      imageHash('example/_95695590_tv039055678.jpg', 16, true, (err, res) => {
        if (err) return reject(err);
        expect(res).toBe('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
        resolve(res);
      });
    });
  });

  it('should hash a local jpg', () => {
    return new Promise((resolve, reject) => {
      imageHash('example/_95695591_tv039055678.jpeg', 16, true, (err, res) => {
        if (err) return reject(err);
        expect(res).toBe('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
        resolve(res);
      });
    });
  });

  it('should hash a local png', () => {
    return new Promise((resolve, reject) => {
      imageHash('example/Example.png', 16, true, (err, res) => {
        if (err) return reject(err);
        expect(res).toBe('00007ffe7c3e780e601e603e7ffe7ffe47fe020642067ff66b066a567ffe7ffe');
        resolve(res);
      });
    });
  });

  it('should hash a local PNG', () => {
    return new Promise((resolve, reject) => {
      imageHash('example/Example2.PNG', 16, true, (err, res) => {
        if (err) return reject(err);
        expect(res).toBe('00007ffe7c3e780e601e603e7ffe7ffe47fe020642067ff66b066a567ffe7ffe');
        resolve(res);
      });
    });
  });

  it('should throw error when there is a mime type mismatch', () => {
    return new Promise((resolve, reject) => {
      imageHash('example/jpgpretendingtobeapng.png', 16, true, (err) => {
        expect(err).toBeInstanceOf(Error);
        resolve(err);
      });
    });
  });

  it('should throw an error when there is no src', () => {
    return new Promise((resolve, reject) => {
      const undef = {};
      // @ts-ignore
      imageHash(undef.some, 16, true, (err) => {
        expect(err).toBeInstanceOf(Error);
        resolve(err);
      });
    });
  });

  it('Should hash remote image', () => {
    return new Promise((resolve, reject) => {
      imageHash('https://ichef.bbci.co.uk/news/800/cpsprodpb/145F4/production/_106744438_p077xzvx.jpg', 16, true, (err, res) => {
        if (err) {
          return reject(err);
        }
        expect(res).toBe('dfffbe3ff83fc03fc43ffc17bc07f803f00ff00ff00fe00ff05fe00fe00fe00f');
        resolve(res);
      });
    });
  });

  it('Should handle error when url is not found', () => {
    return new Promise((resolve, reject) => {
      imageHash('https://ichef.bbo.co.uk/news/800/cpsprodpb/145F4/production/_106744438_p077xzvx.jpg', 16, true, (err) => {
        expect(err).toBeInstanceOf(Error);
        resolve(err);
      });
    });
  });

  it('Should handle error when file is not found', () => {
    return new Promise((resolve, reject) => {
      imageHash('example/jpgpreten.png', 16, true, (err) => {
        expect(err).toBeInstanceOf(Error);
        resolve(err);
      });
    });
  });

  it('Should hash without jpg ext', () => {
    return new Promise((resolve, reject) => {
      imageHash('example/Example', 16, true, (err, res) => {
        if (err) return reject(err);
        expect(res).toBe('00007ffe7c3e780e601e603e7ffe7ffe47fe020642067ff66b066a567ffe7ffe');
        resolve(res);
      });
    });
  });

  it('Should handle error when unreconised mime type', () => {
    return new Promise((resolve, reject) => {
      imageHash('example/local-file-js', 16, true, (err) => {
        expect(err).toBeInstanceOf(Error);
        resolve(err);
      });
    });
  });

  it('Should handle error when unreconised mime type', () => {
    return new Promise((resolve, reject) => {
      imageHash('example/giphygif', 16, true, (err) => {
        expect(err).toBeInstanceOf(Error);
        resolve(err);
      });
    });
  });

  it('Should handle jpg with no file extension', () => {
    return new Promise((resolve, reject) => {
      imageHash('example/_95695592_tv039055678jpeg', 16, true, (err, res) => {
        if (err) return reject(err);
        expect(res).toBe('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
        resolve(res);
      });
    });
  });

  it('Should handle local jpg with file extension', () => {
    return new Promise((resolve, reject) => {
      imageHash('example/_95695591_tv039055678.jpeg', 16, true, (err, res) => {
        if (err) return reject(err);
        expect(res).toBe('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
        resolve(res);
      });
    });
  });

  it('Should handle custom request object', () => {
    return new Promise((resolve, reject) => {
      imageHash({
        url: 'https://ichef.bbci.co.uk/news/800/cpsprodpb/145F4/production/_106744438_p077xzvx.jpg',
      }, 16, true, (err, res) => {
        if (err) {
          return reject(err);
        }
        expect(res).toBe('dfffbe3ff83fc03fc43ffc17bc07f803f00ff00ff00fe00ff05fe00fe00fe00f');
        resolve(res);
      });
    });
  });

  it('Should handle local file buffer', () => {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      fs.readFile(`${__dirname}/../example/_95695591_tv039055678.jpeg`, (err, data) => {
        if (err) {
          return reject(err);
        }
        imageHash({
          ext: 'image/jpeg',
          data,
        }, 16, true, (error, res) => {
          if (error) {
            return reject(error);
          }
          expect(res).toBe('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
          expect(res).not.toHaveLength(0);
          resolve(res);
        });
      });
    });
  });

  it('Should handle buffer with incorrect mime type', () => {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      fs.readFile(`${__dirname}/../example/_95695591_tv039055678.jpeg`, (err, data) => {
        if (err) {
          return reject(err);
        }
        imageHash({
          ext: 'image/jpg',
          data,
        }, 16, true, (error) => {
          expect(error).toBeInstanceOf(Error);
          resolve(error);
        });
      });
    });
  });

  it('Should handle local file buffer, without ext arg', () => {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      fs.readFile(`${__dirname}/../example/_95695591_tv039055678.jpeg`, (err, data) => {
        if (err) {
          return reject(err);
        }
        imageHash({
          data,
        }, 16, true, (error, res) => {
          if (error) {
            return reject(error);
          }
          expect(res).toBe('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
          expect(res).not.toHaveLength(0);
          resolve(res);
        });
      });
    });
  });

  it('Should handle remote file buffer', async () => {
    const testUrl = 'https://ichef.bbci.co.uk/news/800/cpsprodpb/145F4/production/_106744438_p077xzvx.jpg';
    const buffer = await fetchBuffer(testUrl);

    return new Promise((resolve, reject) => {
      imageHash({
        ext: 'image/jpeg',
        data: buffer,
      }, 16, true, (imgErr, res) => {
        if (imgErr) {
          return reject(imgErr);
        }
        expect(res).not.toHaveLength(0);
        expect(res).toBe('dfffbe3ff83fc03fc43ffc17bc07f803f00ff00ff00fe00ff05fe00fe00fe00f');
        resolve(res);
      });
    });
  });

  it('Should handle remote file buffer, without ext arg', async () => {
    const testUrl = 'https://ichef.bbci.co.uk/news/800/cpsprodpb/145F4/production/_106744438_p077xzvx.jpg';
    const buffer = await fetchBuffer(testUrl);

    return new Promise((resolve, reject) => {
      imageHash({
        data: buffer,
      }, 16, true, (imgErr, res) => {
        if (imgErr) {
          return reject(imgErr);
        }
        expect(res).not.toHaveLength(0);
        expect(res).toBe('dfffbe3ff83fc03fc43ffc17bc07f803f00ff00ff00fe00ff05fe00fe00fe00f');
        resolve(res);
      });
    });
  });
});
