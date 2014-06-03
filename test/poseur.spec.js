var chai = require('chai');
var Poseur = require('../lib/poseur');
var expect = chai.expect;

var createRealCaller = function () {
  var realCall = function (key, callback) {
    realCall.called = true;
    return callback(null);
  };

  return realCall;
};

var altCall = function(altContext) {
  var key = altContext.args[0];
  var callback = altContext.args[1];
  var foundVal = altContext.getMock(key);

  altContext.isAsync(true);
  if (foundVal) {
    return callback(foundVal);
  }
  return altContext.callReal();
};

describe('poseur', function () {
  it('should error out when given invalid starting context', function (done) {
    expect(function () { new Poseur({}) })
      .to.throw('poseur.mock-provider must be given a path to the directory where mocks will be located');

    done();
  });

  describe('when given test mocks', function () {
    var provider;

    beforeEach(function (done) {
      provider = new Poseur({
        files: __dirname + '/mock-provider-fixtures/'
      });

      done();
    });

    it('should be able to use them when given valid key', function (done) {
      var realCall = createRealCaller();
      var wrappedCall = provider.wrap(realCall, altCall);

      wrappedCall('foobar.json', function (foundVal) {
        expect(foundVal).to.have.property('foo', 'bar');
        expect(realCall.called).to.not.be.true;

        done();
      });
    });

    it('should be able to handle mock misses', function (done) {
      var realCall = createRealCaller();
      var wrappedCall = provider.wrap(realCall, altCall);

      wrappedCall('baz.json', function (foundVal) {
        expect(realCall.called).to.be.true;
        
        done();
      });
    });

    it('should always invoke real function if provider is disabled', function (done) {
      var realCall = createRealCaller();
      var wrappedCall = provider.wrap(realCall, altCall);

      provider.disable();
      wrappedCall('foobar.json', function (foundVal) {
        expect(realCall.called).to.be.true;
        
        provider.enable();
        wrappedCall('foobar.json', function (foundVal) {
          expect(foundVal).to.have.property('foo', 'bar');
          
          done();
        });
      });
    });
  });
});
