function validateArguments(realCall, altCall) {
  if (typeof(realCall) !== 'function') {
    throw new Error('poseur must be given a function for the first argument');
  }
  if (typeof(altCall) !== 'function') {
    throw new Error('poseur must be given a function for the second argument');
  }
}

function createInvokeContext(invokeThis, invokeArgs, realCall) {
  var _isAsync = false;
  var invokeParamNames = getArgumentNames(realCall);

  var invokeContext = {
    isAsync: function (flag) {
      if (typeof(flag) === 'undefined') {
        return _isAsync;
      }
      _isAsync = !!flag;
      return _isAsync;
    }
  };

  invokeContext.callReal = function () {
    return realCall.apply(invokeThis, invokeArgs);
  };

  var argsMap = invokeArgs.reduce(function (memo, argVal, argKey) {
    memo[argKey] = argVal;
    return memo;
  }, {});

  if (invokeParamNames && invokeParamNames.length > 0) {
    argsMap = invokeParamNames.reduce(function (memo, argName, argIndex) {
      memo[argName] = memo[argIndex];
      return memo;
    }, argsMap);
  }

  invokeContext.args = argsMap;

  return invokeContext;
}

var fnArgsRx = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var fnArgSplitRx = /,/;
var fnArgRx = /^\s*(_?)(.+?)\1\s*$/;
var stripCommentsRx = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

function getArgumentNames(fn) {
  var fnText = fn.toString().replace(stripCommentsRx, '');
  var argDecl = fnText.match(fnArgsRx);
  var fnNames = argDecl[1].split(fnArgSplitRx);
  var fnOut = [];
  fnNames.forEach(function (arg) {
    arg.replace(fnArgRx, function(all, underscore, name){
      fnOut.push(name);
    });
  });

  return fnOut;
}

module.exports = function pose(realCall, altCall) {
  validateArguments(realCall, altCall);

  return function invoke() {
    var invokeThis = this;
    var invokeArgs = Array.prototype.slice.call(arguments);
    var altContext = createInvokeContext(invokeThis, invokeArgs, realCall);
    var altReturn = altCall.call(invokeThis, altContext);
    if (!altContext.isAsync()) {
      if (typeof(altReturn) !== 'undefined') {
        return altReturn;
      } else {
        return altContext.callReal();
      }
    }
    return;
  }
};
