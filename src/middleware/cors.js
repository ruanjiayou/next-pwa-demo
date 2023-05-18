module.exports = function (req, res, next) {
  let CORS = req.app.config.CORS;
  if (CORS.origins === '*') {
    res.header('Access-Control-Allow-Origin', '*');
  } else if (CORS.origins instanceof Array) {
    res.header('Access-Control-Allow-Origin', CORS.origins.join(','));
  }
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
  res.header('Access-Control-Allow-Headers', CORS.headers.join(','));
  //如果一个目标域设置成了允许任意域*的跨域请求，这个请求又带着cookie的话，这个请求是不合法的
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.end();
  } else {
    const accept = req.headers['accept'] || '';
    const dest = req.headers['sec-fetch-dest'] || ''
    if (accept.includes('image/') || dest === 'image') {
      res.header('X-Cacheable', 'true')
    }
    next();
  }
};
