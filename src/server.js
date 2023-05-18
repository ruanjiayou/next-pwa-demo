import express from 'express'
import next from 'next'
import http from 'http'
import { parse } from 'url';
import bodyParser from 'body-parser';
import router from './router.js'
import response from './middleware/response.js';

const httpServer = (express) => {
  return http.createServer(express)
}

class Server {
  constructor(port) {
    this.port = port;
    this.express = express();
    this.next = next({ dev: process.env.NODE_ENV !== 'production' });
  }

  async start() {
    await this.next.prepare()
    // middleware.init()
    // router.init()

    this.initApis();
    this.initCustomPages();
    this.initDefaultPages();

    this.server = httpServer(this.express)
    this.server.listen(this.port, () => {
      console.log(`server launch at: ${this.port} ${process.env.NODE_ENV}`);
    });
  }

  initApis() {
    this.express.use(response);
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }))
    this.express.use('/api', router);
  }

  initCustomPages() {
    // this.express.get('/test/:special_page', (req, res) => {
    //   return this.next.render(req, res, '/special_page', req.query);
    // });
  }
  initDefaultPages() {
    const handle = this.next.getRequestHandler();
    this.express.use((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    })

  }
}

export default Server;