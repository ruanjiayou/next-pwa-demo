const request = require('../extend/request');
const response = require('../extend/response');

module.exports = async function (req, res, next) {
  Object.defineProperty(req, 'app', {
    value: this,
    writable: false,
    enumerable: false,
    configurable: false
  });
  Object.defineProperty(res, 'app', {
    value: this,
    writable: false,
    enumerable: false,
    configurable: false
  });
  for (let k in request) {
    req[k] = request[k].bind(req);
  }
  for (let k in response) {
    res[k] = response[k].bind(res);
  }
  if (this.config.AUTH && this.config.AUTH.key) {
    let key = this.config.AUTH.key.toLocaleLowerCase();
    req.headers['Authorization'] = req.headers[key] || req.cookies[key] || (req.query && req.query[key]) || (req.body && req.body[key]);
  }
  res.locals.SYSTEM = this.config.SYSTEM;
  next();
};