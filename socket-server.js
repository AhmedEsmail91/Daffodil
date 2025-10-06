const {Server} = require('socket.io');
const http = require('http');
const socketRoutes= require('./src/socket/index.routes.js');
const chalk = require('chalk');
const initializeSocketServer = (app) => {
    const server= http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: '*',
            credentials: true,
        }
    });
    console.log(chalk.hex('#684fc4ff')('Socket server initialized...'));
    socketRoutes(io);
    app.set('io', io);
    return {io, server};
};

module.exports = { initializeSocketServer };
