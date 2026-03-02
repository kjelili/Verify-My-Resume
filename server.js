/**
 * Local dev server: loads .env and serves static files + /api/jobs.
 * Run: npm run dev-api
 * Then open http://localhost:3000 and search; jobs come from Google Jobs via SerpAPI.
 */
require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const jobsHandler = require('./api/jobs.js');

const MIMES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // Mount API
  if (pathname === '/api/jobs') {
    const adapterReq = {
      method: req.method,
      query: parsed.query
    };
    const adapterRes = {
      _headers: {},
      setHeader(name, value) {
        this._headers[name] = value;
        res.setHeader(name, value);
      },
      status(code) {
        res.statusCode = code;
        return this;
      },
      end(body) {
        res.end(body);
      },
      json(obj) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(obj));
      }
    };
    jobsHandler(adapterReq, adapterRes).catch(err => {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ results: [], error: String(err.message) }));
    });
    return;
  }

  // Static files
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  if (!path.relative(__dirname, filePath).split(path.sep).every(p => p !== '..')) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = err.code === 'ENOENT' ? 404 : 500;
      res.end(err.code === 'ENOENT' ? 'Not Found' : 'Server Error');
      return;
    }
    const ext = path.extname(filePath);
    if (MIMES[ext]) res.setHeader('Content-Type', MIMES[ext]);
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`VerifyIQ dev server: http://localhost:${PORT}`);
  console.log(`  API: http://localhost:${PORT}/api/jobs`);
  console.log(`  .env loaded: SERPAPI_KEY is ${process.env.SERPAPI_KEY ? 'set' : 'NOT set'}`);
});
