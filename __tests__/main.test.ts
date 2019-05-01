import imageHash from '../src/imageHash';

describe('hash images', () => {
  test('should hash a local jpg', (done) => {
    imageHash('example/_95695590_tv039055678.jpg', 16, true, (err, res) => {
      expect(res).toEqual('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
      done();
    });
  });

  test('should hash a local jpg', (done) => {
    imageHash('example/_95695591_tv039055678.jpeg', 16, true, (err, res) => {
      expect(res).toEqual('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
      done();
    });
  });

  test('should hash a local png', (done) => {
    imageHash('example/Example.png', 16, true, (err, res) => {
      expect(res).toEqual('00007ffe7c3e780e601e603e7ffe7ffe47fe020642067ff66b066a567ffe7ffe');
      done();
    });
  });

  test('should hash a local PNG', (done) => {
    imageHash('example/Example.PNG', 16, true, (err, res) => {
      expect(res).toEqual('00007ffe7c3e780e601e603e7ffe7ffe47fe020642067ff66b066a567ffe7ffe');
      done();
    });
  });

  test('should throw error when there is a mime type mismatch', (done) => {
    imageHash('example/jpgpretendingtobeapng.png', 16, true, (err) => {
      expect(err).toBeInstanceOf(Error);
      done();
    });
  });

  test('should throw an error when there is no src', (done) => {
    const undef = {};
    // @ts-ignore
    imageHash(undef.some, 16, true, (err) => {
      expect(err).toBeInstanceOf(Error);
      done();
    });
  });

  test('Should hash remote image', (done) => {
    imageHash('https://ichef.bbci.co.uk/news/800/cpsprodpb/145F4/production/_106744438_p077xzvx.jpg', 16, true, (err, res) => {
      expect(res).toBe('ffffbe7ff83fc03fc43ffc17bc07f807f00ff00ff00fe00ff05fe00fe00fe00f');
      done();
    });
  });

  test('Should handle error when url is not found', (done) => {
    imageHash('https://ichef.bbo.co.uk/news/800/cpsprodpb/145F4/production/_106744438_p077xzvx.jpg', 16, true, (err) => {
      expect(err).toBeInstanceOf(Error);
      done();
    });
  });

  test('Should handle error when file is not found', (done) => {
    imageHash('example/jpgpreten.png', 16, true, (err) => {
      expect(err).toBeInstanceOf(Error);
      done();
    });
  });

  test('Should hash without jpg ext', (done) => {
    imageHash('example/Example', 16, true, (err, res) => {
      expect(res).toBe('00007ffe7c3e780e601e603e7ffe7ffe47fe020642067ff66b066a567ffe7ffe');
      done();
    });
  });

  test('Should handle error when unreconised mime type', (done) => {
    imageHash('example/local-file-js', 16, true, (err) => {
      expect(err).toBeInstanceOf(Error);
      done();
    });
  });

  test('Should handle error when unreconised mime type', (done) => {
    imageHash('example/giphygif', 16, true, (err) => {
      expect(err).toBeInstanceOf(Error);
      done();
    });
  });

  test('Should handle jpg with no file extension', (done) => {
    imageHash('example/_95695592_tv039055678jpeg', 16, true, (err, res) => {
      expect(res).toBe('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
      done();
    });
  });

  test('Should handle local jpg with file extension', (done) => {
    imageHash('example/_95695591_tv039055678.jpeg', 16, true, (err, res) => {
      expect(res).toBe('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
      done();
    });
  });

  test('Should handle custom request object', (done) => {
    imageHash({
      url: 'https://ichef.bbci.co.uk/news/800/cpsprodpb/145F4/production/_106744438_p077xzvx.jpg',
    }, 16, true, (err, res) => {
      expect(res).toBe('ffffbe7ff83fc03fc43ffc17bc07f807f00ff00ff00fe00ff05fe00fe00fe00f');
      done();
    });
  });
});
