// normal functions to access the data and the logic implementation

const errorEvent = require("../../utils/errors/EventError.js");

//e.g:
const  getExampleData= async(socket,data,next)=>{
    // Example data retrieval logic
    const exampleData = {
        id: 1,
        name: "Example Data",
        description: "This is an example data object."
    };
    socket.emit('exampleData', exampleData);
    next();   
}
const processExampleInput = async (socket,data,next) => {
    
    console.log('Processing input:', data);
    if (typeof data.name === "string") {
        return socket.emit('inputProcessed', {
            message: "success",
            data: data.name.toUpperCase()
        });
    } else {
        return errorEvent(socket, 'notFound', 'Invalid input type',{}, 404);
    }
}
// User with permissions example:

module.exports = {
    getExampleData,
    processExampleInput
};