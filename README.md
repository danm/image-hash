# image-hash

A wrapper around [block-hash](https://github.com/commonsmachinery/blockhash-js) to easily hash a local or remote file with Node.

Supports JPG, PNG and WebP

## Install

```bash
npm i image-hash
```

## Use

```javascript
const { imageHash }= require('image-hash');

// remote file simple
imageHash('https://ichef-1.bbci.co.uk/news/660/cpsprodpb/7F76/production/_95703623_mediaitem95703620.jpg', 16, true).then(data => {
  console.log(data);
  // 0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0
});

//local file
imageHash('./_95695590_tv039055678.jpg', 16, true).then(data => {
  console.log(data);
  // 0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0
});

//Buffer
const fBuffer = fs.readFileSync(__dirname + '/example/_95695591_tv039055678.jpeg');
imageHash({
  ext: 'image/jpeg',
  data: fBuffer
}, 16, true).then(data => {
  console.log(data);
  // 0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0
});

//Buffer, without ext arg
const fBuffer = fs.readFileSync(__dirname + '/example/_95695591_tv039055678.jpeg');
imageHash({
  data: fBuffer
}, 16, true).then(data => {
  console.log(data);
  // 0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0
});
```

## API

```typescript
// name
imageHash(location, bits, precise);

// types
imageHash(string|object, int, bool): Promise<string>;
```

## SETTINGS
Image hash will log out warnings if environment variable `VERBOSE` is set to true.


### Image-Hash Arguments

| Argument | Type | Description | Mandatory | Example |
| -------- | ---- | ----------- | --------- | ------- |
| location | `object` or `string` | `Buffer` object (See input types below for more details), or `String` with a valid url or file location | Yes | see above |
| bits | `int` | The number of bits in a row. The more bits, the more unique the hash. | Yes | 8 |
| precise  | `bool` | Whether a precision algorithm is used. `true` Precise but slower, non-overlapping blocks. `false` Quick and crude, non-overlapping blocks. Method 2 is recommended as a good tradeoff between speed and good matches on any image size. The quick ones are only advisable when the image width and height are an even multiple of the number of blocks used. | Yes | `true` |

#### Location Object Types

```typescript
// Buffer Object
interface BufferObject {
  ext?: string, // mime type of buffered file
  data: Buffer,
  name?: string // file name for buffered file
};
```

## Credit

The hard bit of this comes with thanks from [commonsmachinery](https://github.com/commonsmachinery) for [blockhash-js](https://github.com/commonsmachinery/blockhash-js)

## License

Distributed under an MIT license
