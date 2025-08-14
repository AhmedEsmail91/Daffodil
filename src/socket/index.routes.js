const exampleRoutes = require('./modules/example/example.route.js');
module.exports = (io) => {
    // Initialize routes
    io.on('connection', (socket) => {
        exampleRoutes.init(io, socket);
        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('Socket disconnected:', socket.id);
        });
    });
};
