var express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const multer = require('multer');
const bodyParser = require('body-parser');
module.exports = (app) => {
    app.use(express.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cors({
      origin: 'http://localhost:8080', // your React dev server origin
      credentials: true,               // allow cookies / headers
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
  }));
    app.use(helmet());
    app.use(compression());
    app.use(require('./1stMw.js').loggingUrl);
    app.use(require('./../src/middlewares/lang.js')); // Set language preference from headers
    // app.use((req, res, next) => {
    //   res.header('Access-Control-Allow-Origin', '*');
    //   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, application/json, text/plain');
    //   res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    //   res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-age=0, post-check=0, pre-check=0');
    //   next();
    // });
    
};
