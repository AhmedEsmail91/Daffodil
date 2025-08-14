const chaining=require('../../utils/middlewares-chaining.js');
const { Authenticate, allowedTo, getLang }=require('../../middlewares/auth.js');
const validation=require('../../middlewares/validation.js');
const { getExampleData, processExampleInput } = require('./example.controller.js');
const { testSchema } = require('./example.validation.js');
const init = async (io, socket) => {
    socket.emit('exampleData', chaining([getExampleData]));
    socket.removeAllListeners('processInput');
    socket.on('processInput', chaining([Authenticate, getLang, validation(testSchema), processExampleInput]));
};
module.exports = {init};