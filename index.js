const express = require('express')
require('dotenv').config({ debug: false,quiet:true });
const fs = require('fs');
const https = require('https');

const chalk=require('chalk');
const app = express()
const port = process.env.NODE_ENV === "development"
	? (process.env.DEV_PORT || 3000)
	: (process.env.PORT || 3000);
require("./src/routes/index.js")(app);

app.listen(port, () => console.log(chalk.magentaBright(`App listening on port ${port} for now !`)))
// https.createServer(sslOptions, app).listen(port, () => {
//   console.log(chalk.magentaBright(`✅ Dev HTTPS Server running at https://localhost:${port}`));
// });
