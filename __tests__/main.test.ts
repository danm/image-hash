import { readFile } from 'fs/promises';
import { expect, describe, it } from '@jest/globals';
import { imageHash } from '../src/index';

describe('hash images', () => {
  it('should hash a local jpg', async () => {
    await expect(imageHash('examples/assets/_95695590_tv039055678.jpg', 16, true)).resolves.toEqual('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
  });

  it('should hash a local jpg', async () => {
    await expect(imageHash('examples/assets/_95695591_tv039055678.jpeg', 16, true)).resolves.toEqual('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
  });

  it('should hash a local png', async () => {
    await expect(imageHash('examples/assets/Example.png', 16, true)).resolves.toEqual('00007ffe7c3e780e601e603e7ffe7ffe47fe020642067ff66b066a567ffe7ffe');
  });

  it('should hash a local PNG', async () => {
    await expect(imageHash('examples/assets/Example2.PNG', 16, true)).resolves.toEqual('00007ffe7c3e780e601e603e7ffe7ffe47fe020642067ff66b066a567ffe7ffe');
  });

  it('should throw error when there is a mime type mismatch', async () => {
    await expect(imageHash('examples/assets/jpgpretendingtobeapng.png', 16, true)).rejects.toThrow();
  });

  it('should throw an error when there is no src', async () => {
    await expect(imageHash(undefined as any, 16, true)).rejects.toThrow();
  });

  it('Should hash remote image', async () => {
    await expect(imageHash('https://ichef.bbci.co.uk/news/800/cpsprodpb/145F4/production/_106744438_p077xzvx.jpg', 16, true)).resolves.toEqual('dfffbe3ff83fc03fc43ffc17bc07f803f00ff00ff00fe00ff05fe00fe00fe00f');
  });

  it('Should handle error when url is not found', async () => {
    await expect(imageHash('https://ichef.bbo.co.uk/news/800/cpsprodpb/145F4/production/_106744438_p077xzvx.jpg', 16, true)).rejects.toThrow();
  });

  it('Should handle error when file is not found', async () => {
    await expect(imageHash('examples/assets/jpgpreten.png', 16, true)).rejects.toThrow(`ENOENT: no such file or directory, open 'examples/assets/jpgpreten.png'`);
  });

  it('Should hash without jpg ext', async () => {
    await expect(imageHash('examples/assets/Example', 16, true)).resolves.toEqual('00007ffe7c3e780e601e603e7ffe7ffe47fe020642067ff66b066a567ffe7ffe');
  });

  it('Should handle error when unreconised mime type', async () => {
    await expect(imageHash('examples/assets/local-file-js', 16, true)).rejects.toThrow();
  });

  it('Should handle error when unreconised mime type', async () => {
    await expect(imageHash('examples/assets/giphygif', 16, true)).rejects.toThrow();
  });

  it('Should handle jpg with no file extension', async () => {
    await expect(imageHash('examples/assets/_95695592_tv039055678jpeg', 16, true)).resolves.toEqual('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
  });

  it('Should handle local jpg with file extension', async () => {
    await expect(imageHash('examples/assets/_95695591_tv039055678.jpeg', 16, true)).resolves.toEqual('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
  });

  it('Should handle url when no extenion provided (#7)', async () => {
    await expect(imageHash('https://falabella.scene7.com/is/image/Falabella/prod11830022_6', 16, true)).resolves.toEqual('80ff807f807f807fcc7fc007c067c077c8f3c183c013ccf7c823c8f3f8f7f8ff');
  });

  it('Should handle local file buffer', async () => {
    const data = await readFile(`${__dirname}/../examples/assets/_95695591_tv039055678.jpeg`);
    await expect(imageHash({ ext: 'image/jpeg', data }, 16, true)).resolves.toEqual('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
  });

  it('Should handle buffer with incorrect mime type', async () => {
    const data = await readFile(`${__dirname}/../examples/assets/_95695591_tv039055678.jpeg`);
    await expect(imageHash({ ext: 'image/jpg', data }, 16, true)).rejects.toThrow('Unrecognized mime type: image/jpg');
  });

  it('Should handle local file buffer, without ext arg', async () => {
    const data = await readFile(`${__dirname}/../examples/assets/_95695591_tv039055678.jpeg`);
    await expect(imageHash({ data }, 16, true)).resolves.toEqual('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
  });

  it('Should handle remote file buffer', async () => {
    const response = await fetch('https://ichef.bbci.co.uk/news/800/cpsprodpb/145F4/production/_106744438_p077xzvx.jpg')
    const buffer = Buffer.from(await response.arrayBuffer());
    await expect(imageHash({ ext: 'image/jpeg', data: buffer }, 16, true)).resolves.toEqual('dfffbe3ff83fc03fc43ffc17bc07f803f00ff00ff00fe00ff05fe00fe00fe00f');
  });

  it('Should handle remote file buffer, without ext arg', async () => {
    const response = await fetch('https://ichef.bbci.co.uk/news/800/cpsprodpb/145F4/production/_106744438_p077xzvx.jpg')
    const buffer = Buffer.from(await response.arrayBuffer());
    await expect(imageHash({ data: buffer }, 16, true)).resolves.toEqual('dfffbe3ff83fc03fc43ffc17bc07f803f00ff00ff00fe00ff05fe00fe00fe00f');
  });
});
