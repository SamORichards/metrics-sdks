const request = require('r2');
const config = require('config');

module.exports = (apiKey, group) => {
  if (!apiKey) throw new Error('You must provide your ReadMe API key');
  if (!group) throw new Error('You must provide a grouping function');

  const encoded = Buffer.from(`${apiKey}:`).toString('base64');

  return (req, res, next) => {
    function send() {
      request.post(`${config.host}/request`, {
        headers: { authorization: `Basic ${encoded}` },
        json: { group: group(req) },
      });
      cleanup(); // eslint-disable-line no-use-before-define
    }

    function cleanup() {
      res.removeListener('finish', send);
      res.removeListener('error', cleanup);
      res.removeListener('close', cleanup);
    }

    // Add response listeners
    res.once('finish', send);
    res.once('error', cleanup);
    res.once('close', cleanup);

    return next();
  };
};
