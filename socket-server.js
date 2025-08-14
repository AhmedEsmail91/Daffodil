const {Server} = require('socket.io');
const http = require('http');
const socketRoutes= require('./src/socket/index.routes.js');
const chalk = require('chalk');
const initializeSocketServer = (app) => {
    const server= http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: '*'
        }
    });
    console.log(chalk.hex('#684fc4ff')('Socket server initialized...'));
    io.on('connection', async (socket) => {
        console.log('New client connected with ID:', socket.id);
        // Initialize socket routes
        socketRoutes(io,socket);
        socket.on('disconnect', () => {
            console.log('Client disconnected with ID:', socket.id);
        });
    });
    app.set('io', io);
    return {io, server};
};

module.exports = { initializeSocketServer };
