const express = require('express');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const { createReadStream } = require('fs');

app
  .prepare()
  .then(() => {
    const server = express();

    server.get('/robots.txt', (req, res) => {
      res.setHeader('Content-Type', 'text/plain;charset=UTF-8');
      return createReadStream('./static/robots.txt').pipe(res);
    });

    server.get('/sw.js', (req, res) => {
      res.setHeader('Content-Type', 'text/javascript');
      res.setHeader(
        'Cache-Control',
        'max-age=0,no-cache,no-store,must-revalidate',
      );
      return createReadStream('./static/serviceWorker.js').pipe(res);
    });

    server.get('/:id', (req, res) => {
      const actualPage = '/recipe';
      const queryParams = { id: req.params.id };
      app.render(req, res, actualPage, queryParams);
    });

    server.get('*', (req, res) => {
      return handle(req, res);
    });

    server.listen(3000, err => {
      if (err) throw err;
      console.log('> Ready on http://localhost:3000');
    });
  })
  .catch(ex => {
    console.error(ex.stack);
    process.exit(1);
  });
