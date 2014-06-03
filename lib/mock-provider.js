var fs = require('fs');
var path = require('path');

var MockProvider = module.exports = function (context) {
  validateContext(context);
  this._context = context;
  this._cache = {};
};

MockProvider.prototype.getMock = function (fileName) {
  var filePath = this._context.files;
  var fileReadOptions = { encoding: this._context.encoding || 'utf8' };
  var fullPath = path.join(filePath, fileName);
  var fileExt = path.extname(fileName);
  var loaded = this._cache[fileName];

  if (!(fileName in this._cache)) {
    var isRequired = fileExt === '.js' || fileExt === '.json';

    try {
      loaded = isRequired ? require(fullPath) : fs.readFileSync(fullPath, fileReadOptions);
    } catch (err) {}
    this._cache[fileName] = loaded;
  }

  return loaded;
};

function validateContext(context) {
  if (!context) {
    throw new Error('poseur.mock-provider must be given a context');
  }
  if (typeof(context.files) !== 'string') {
    throw new Error('poseur.mock-provider must be given a path to the directory where mocks will be located');
  }
}
