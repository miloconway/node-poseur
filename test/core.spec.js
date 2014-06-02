var chai = require('chai');
var core = require('../lib/core');
var expect = chai.expect;

var unmasked = function (key) {
  return {
    id: key
  };
};

var unmaskedAsync = function (key, next) {
  return next(unmasked(key));
};

var altProvider = function (altContext) {
  var baseKey = altContext.args.key;
  if (baseKey !== 'echo' && baseKey !== 'tango') {
    return unmasked(baseKey + '-fake');
  }
  return;
};

var altProviderAsync = function (altContext) {
  altContext.isAsync(true);
  var altProvided = altProvider(altContext);
  if (altProvided) {
    return altContext.args.next(altProvided);
  }
  return altContext.callReal();
};

describe('poseur', function () {
  describe('core', function () {

    it('should error when not given correct arguments', function (done) {
      expect(function () { core() })
        .to.throw('poseur must be given a function for the first argument');
      expect(function () { core(unmasked) })
        .to.throw('poseur must be given a function for the second argument');
      done();
    });

    describe('when working synchronously', function () {
      var masked = core(unmasked, altProvider);

      it('should not affect the unmasked function', function (done) {
        var unmaskedResult = unmasked('hotel');
        
        expect(unmaskedResult).to.have.property('id', 'hotel');
        done();
      });

      it('should be able to mask the unmasked function', function (done) {
        var maskedResult = masked('sierra');
        
        expect(maskedResult).to.have.property('id', 'sierra-fake');
        done();
      });

      it('should be able to get unmasked result from masked function', function (done) {
        var maybeMaskedResult = masked('echo');
        
        expect(maybeMaskedResult).to.have.property('id', 'echo');
        done();
      });
    });

    describe('when working asynchronously', function () {
      var maskedAsync = core(unmaskedAsync, altProviderAsync);

      it('should not affect the unmasked function', function (done) {
        var callback = function (result) {
          expect(result).to.have.property('id', 'bravo'); 
          done();
        };
        unmaskedAsync('bravo', callback);
      });

      it('should be able to mask the unmasked function', function (done) {
        var callback = function (result) {
          expect(result).to.have.property('id', 'foxtrot-fake');
          done();
        };

        maskedAsync('foxtrot', callback);
      });

      it('should be able to get unmasked result from masked function', function (done) {
        var callback = function (result) {
          expect(result).to.have.property('id', 'tango');
          done();
        };
        
        maskedAsync('tango', callback);
      });
    });
  });
});
