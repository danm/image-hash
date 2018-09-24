const mocha = require('mocha');
const chai = require('chai');
const expect = chai.expect;
const imageHash = require('../index');

describe("hash images", function() {
    it('should hash a local jpg', function(done) {
        //arrange
        imageHash('example/_95695590_tv039055678.jpg', 16, true, (err, res) => {
          if (err) throw err;
          expect(res).to.equal('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
          done()
        });
    });
    it('should hash a local jpeg', function(done) {
      //arrange
      imageHash('example/_95695591_tv039055678.jpeg', 16, true, (err, res) => {
        if (err) throw err;
        expect(res).to.equal('0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0');
        done()
      });
    });
    it('should hash a local png', function(done) {
      //arrange
      imageHash('example/Example.png', 16, true, (err, res) => {
        if (err) throw err;
        expect(res).to.equal('00007ffe7c3e780e601e603e7ffe7ffe47fe020642067ff66b066a567ffe7ffe');
        done()
      });
    });
    it('should hash a local PNG', function(done) {
      //arrange
      imageHash('example/Example.PNG', 16, true, (err, res) => {
        if (err) throw err;
        expect(res).to.equal('00007ffe7c3e780e601e603e7ffe7ffe47fe020642067ff66b066a567ffe7ffe');
        done()
      });
    });
    it('should throw error when there is a mime type mismatch', function(done) {
      //arrange
      imageHash('example/Example.jpg', 16, true, (err, res) => {
        expect(function() {
          if (err) throw err;
        }).to.throw();
        done();
      });
    });
});