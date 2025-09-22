const express = require('express')
require('dotenv').config({ debug: false,quiet:true });
const chalk=require('chalk');
const app = express()
const port = process.env.NODE_ENV === "development" 
	? (process.env.DEV_PORT || 3000) 
	: (process.env.PORT || 3000);
require("./src/routes/index.js")(app);

//socket server and config:
// const {initializeSocketServer}=require('./socket-server.js');
// const {io, server} = initializeSocketServer(app);
// require('./src/socket/index.routes.js')(io);

app.listen(port, () => console.log(chalk.magentaBright(`App listening on port ${port} for now !`)))