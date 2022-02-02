import { expect } from 'chai';
import fs from 'fs';
import got from 'got';
import imageHash from '../src/imageHash';

describe('hash images', () => {
  it('should hash a local jpg', async () => {
    try {
      const res = await imageHash('example/_95695590_tv039055678.jpg', 16, true);
      expect(res).to.equal('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');  
    } catch (e) {
      console.log(e);
    }
  });

  it('should hash a local jpg', async () => {
    const res = await imageHash('example/_95695591_tv039055678.jpeg', 16, true);
    expect(res).to.equal('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
  });

  it('should hash a local png', async () => {
    const res = await imageHash('example/Example.png', 16, true);
    expect(res).to.equal('00007ffe7c3e780e601e603e7ffe7ffe47fe020642067ff66b066a567ffe7ffe');
  });

  it('should hash a local PNG', async () => {
    const res = await imageHash('example/Example2.PNG', 16, true);
    expect(res).to.equal('00007ffe7c3e780e601e603e7ffe7ffe47fe020642067ff66b066a567ffe7ffe');
  });

  it('should throw error when there is a mime type mismatch', async () => {
    try {
      await imageHash('example/jpgpretendingtobeapng.png', 16, true);
    } catch (e) {
      expect(e).instanceOf(Error);
    }
  });

  it('should throw an error when there is no src', (done) => {
    const undef = {};
    try {
      // @ts-ignore
      imageHash(undef, 16, true);
    } catch (e) {
      expect(e).instanceOf(Error);
    }
  });

  it('Should hash remote image', async() => {
    const res = await imageHash('https://ichef.bbci.co.uk/news/800/cpsprodpb/145F4/production/_106744438_p077xzvx.jpg', 16, true);
    expect(res).to.equal('dfffbe3ff83fc03fc43ffc17bc07f803f00ff00ff00fe00ff05fe00fe00fe00f');
  });

  it('Should handle error when url is not found', async () => {
    try {
      await imageHash('https://ichef.bbo.co.uk/news/800/cpsprodpb/145F4/production/_106744438_p077xzvx.jpg', 16, true);
    } catch (e) {
      expect(e).instanceOf(Error);
    }
  });

  it('Should handle error when file is not found', async () => {
    try {
      await imageHash('example/jpgpreten.png', 16, true);
    } catch (e) {
      expect(e).instanceOf(Error);
    }
  });

  it('Should hash without jpg ext', async () => {
    const res = await imageHash('example/Example', 16, true);
    expect(res).to.equal('00007ffe7c3e780e601e603e7ffe7ffe47fe020642067ff66b066a567ffe7ffe');
  });

  it('Should handle error when unreconised mime type', async () => {
    try {
      await imageHash('example/local-file-js', 16, true);
    } catch (e) {
      expect(2).instanceOf(Error);
    }
  });

  it('Should handle error when unreconised mime type', async () => {
    try {
      await imageHash('example/giphygif', 16, true);
    } catch (e) {
      expect(2).instanceOf(Error);
    }
  });

  it('Should handle jpg with no file extension', async () => {
    const res = await imageHash('example/_95695592_tv039055678jpeg', 16, true);
    expect(res).to.equal('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
  });

  it('Should handle local jpg with file extension', async () => {
    const res = await imageHash('example/_95695591_tv039055678.jpeg', 16, true);
    expect(res).to.equal('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
  });

  it('Should handle custom request object', async () => {
    const res = await imageHash({
      url: 'https://ichef.bbci.co.uk/news/800/cpsprodpb/145F4/production/_106744438_p077xzvx.jpg',
    }, 16, true);
    expect(res).to.equal('dfffbe3ff83fc03fc43ffc17bc07f803f00ff00ff00fe00ff05fe00fe00fe00f');
  });

  it('Should handle url when no extenion provided (#7)', async () => {
    const res = await imageHash({
      url: 'https://falabella.scene7.com/is/image/Falabella/prod11830022_6',
    }, 16, true);
    expect(res).to.equal('80ff807f807f807fcc7fc007c067c077c8f3c183c013ccf7c823c8f3f8f7f8ff');
  });

  it('Should handle local file buffer', async () => {
    const data = fs.readFileSync(`${__dirname}/../example/_95695591_tv039055678.jpeg`);
    const res = await imageHash({
      ext: 'image/jpeg',
      data,
    }, 16, true);
    expect(res).equal('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0').and.not.length(0);
  });

  it('Should handle buffer with incorrect mime type', async () => {
    const data = fs.readFileSync(`${__dirname}/../example/_95695591_tv039055678.jpeg`);
    try {
      await imageHash({
        ext: 'image/jpg',
        data,
      }, 16, true);
    } catch (e) {
      expect(e).instanceOf(Error);
    }
  });

  it('Should handle local file buffer, without ext arg', async () => {
    const data = fs.readFileSync(`${__dirname}/../example/_95695591_tv039055678.jpeg`)
    const res = await imageHash({
      data,
    }, 16, true)
    expect(res).equal('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0').and.not.length(0);
  });

  it('Should handle remote file buffer', async () => {
    const testUrl = 'https://ichef.bbci.co.uk/news/800/cpsprodpb/145F4/production/_106744438_p077xzvx.jpg';
    const { rawBody } = await got(testUrl);
    
    const res = await imageHash({
      ext: 'image/jpeg',
      data: rawBody,
    }, 16, true);
    expect(res).not.length(0).and.equal('dfffbe3ff83fc03fc43ffc17bc07f803f00ff00ff00fe00ff05fe00fe00fe00f');
  });

  it('Should handle remote file buffer, without ext arg', async () => {
    const testUrl = 'https://ichef.bbci.co.uk/news/800/cpsprodpb/145F4/production/_106744438_p077xzvx.jpg';
    const { rawBody } = await got(testUrl);
    
    const res = await imageHash({
      data: rawBody,
    }, 16, true);
    expect(res).not.length(0).and.equal('dfffbe3ff83fc03fc43ffc17bc07f803f00ff00ff00fe00ff05fe00fe00fe00f');
  });
});
