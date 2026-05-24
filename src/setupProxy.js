const https = require('https');
const { URL } = require('url');

function get(urlStr) {
  return new Promise((resolve, reject) => {
    https.get(new URL(urlStr), (res) => {
      if ([301, 302, 303].includes(res.statusCode) && res.headers.location) {
        return get(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function post(urlStr, body) {
  return new Promise((resolve, reject) => {
    const buf = Buffer.from(body, 'utf8');
    const req = https.request(new URL(urlStr), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain', 'Content-Length': buf.length },
    }, (res) => {
      if ([301, 302, 303].includes(res.statusCode) && res.headers.location) {
        return get(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.write(buf);
    req.end();
  });
}

module.exports = function (app) {
  app.post('/gas-proxy', (req, res) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      const scriptUrl = process.env.REACT_APP_SCRIPT_URL;
      const action = req.query.action || '';
      try {
        const data = await post(`${scriptUrl}?action=${action}`, body);
        res.setHeader('Content-Type', 'application/json');
        res.end(data);
      } catch (e) {
        res.status(500).end(JSON.stringify({ error: e.message }));
      }
    });
  });
};
