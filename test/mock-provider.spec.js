var chai = require('chai');
var MockProvider = require('../lib/mock-provider');
var expect = chai.expect;

describe('poseur', function () {
  describe('mock-provider', function () {
    it('should error out when given invalid starting context', function (done) {
      expect(function () { new MockProvider({}) })
        .to.throw('poseur.mock-provider must be given a path to the directory where mocks will be located');

      done();
    });

    describe('when given test mocks', function () {
      var provider = new MockProvider({
        files: __dirname + '/mock-provider-fixtures/'
      });

      it('should be able to provide fixed mocks', function (done) {
        expect(provider.getMock('foobar.json')).to.have.property('foo', 'bar');
        expect(provider.getMock('hello-world.txt')).to.equal('Hello World!\n');
        expect(provider.getMock('unknown_file.txt')).to.not.be.true;

        done();
      });
    });
  });
});
