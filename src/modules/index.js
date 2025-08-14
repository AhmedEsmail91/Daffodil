const express = require('express');
const allRoutes=require('./pre-index.js');

const {globalError} = require('./../../utils/errors/globalError.js');
const authenticateDB = require('../../config/dbConnection.js');
const logger = require('../../config/logger');
const authRouter = require('./Auth/auth.routes.js');

const bootstrap = (app) => {
    // dbAuth
    authenticateDB();
    // loading Basic Configurations
    require('./../../utils/serverBasicConfig.js')(app);
    app.use('/uploads', express.static('uploads'));

    // check app is running
    app.get('/', (req, res) => res.send('App is running!'))
    
    // prefix
    const prefix = process.env.PREFIX || 'api';
    // calling routes
    allRoutes(app,prefix);

    // for error handling
    app.use((req, res) => {
        logger.warn(`404 - Not Found: ${req.originalUrl}`);
        res.status(404).json({
            message: "404 Not Found"
        });
    });
    app.use(globalError);

    process.on('uncaughtException', (err) => {
        logger.error('Uncaught Exception:', err);
        process.exit(1);
    });
    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection:', reason);
        process.exit(1);
    });
}

module.exports = bootstrap;