var express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
module.exports = (app) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cors({
      origin: ['http://localhost:8080','http://localhost:8081','http://localhost:8082',"http://localhost:5173",
        'http://192.168.1.5:8080'
      ], // your React dev server origin
      credentials: true,               // allow cookies / headers
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
    }));

    app.use(cookieParser());
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
