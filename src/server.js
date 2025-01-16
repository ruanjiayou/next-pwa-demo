import express from 'express'
import next from 'next'
import http from 'http'
import { parse } from 'url';
import bodyParser from 'body-parser';
import router from './router.js'
import response from './middleware/response.js';
import { init } from './mongodb.js';
import mongoose from 'mongoose';
import { MConnection, MJsonSchema } from 'schema/dist/index.js';
import config from './config.js';

const httpServer = (express) => {
  return http.createServer(express)
}
/** @typedef {import('./@types/server').models} models */
class Server {
  /**
   * @type {models}
   */
  models;
  constructor(port) {
    this.port = port;
    this.express = express();
    this.next = next({ dev: process.env.NODE_ENV !== 'production' });
    this.dbs = {};
    this.models = {};
  }

  async start() {
    await this.next.prepare()
    // middleware.init()
    // router.init()
    // 数据库初始化
    this.initMongo();

    this.initApis();
    this.initCustomPages();
    this.initDefaultPages();

    this.server = httpServer(this.express)
    this.server.listen(this.port, () => {
      console.log(`server launch at: http://localhost:${this.port} ${process.env.NODE_ENV}`);
    });
  }

  async initMongo() {
    const system = mongoose.createConnection(config.mongo_system_url);
    const Connection = new MConnection(system);
    const JsonSchema = new MJsonSchema(system);
    const connections = await Connection.getAll({ where: { status: 1 }, lean: true });
    const dbs = { system };
    connections.forEach(connection => {
      dbs[connection._id] = mongoose.createConnection(config.mongo_system_url.replace('schema', connection._id));
    });
    this.dbs = dbs;
    this.models = await init(dbs, JsonSchema);
  }

  initApis() {
    this.express.use((req, res, next) => {
      res.models = this.models;
      res.dbs = this.dbs;
      next();
    })
    this.express.use(response);
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }))
    this.express.use('/api', (req, res, next) => {
      res.header({
        'Access-Control-Allow-Private-Network': true,
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      })
      next();
    }, router);
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