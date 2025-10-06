const chalk = require("chalk");

// const regularLog=(req, res, next) => {
//     global.currentRequest = req;
//     global.fullUrl = 
//     const url = new URL(fullUrl);
//     global.baseUrl = `${url.protocol}//${url.host}${url.pathname}`;
//     next();
// };
// global.currentRequest = req;
// global.fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
// const url = new URL(fullUrl);
// global.baseUrl = `${url.protocol}//${url.host}${url.pathname}`;
// next();

const loggingUrl = (req, res, next) => {
    const startHrTime = process.hrtime();

    res.on('finish', () => {
        const elapsedHrTime = process.hrtime(startHrTime);
        const elapsedTimeInMs = (elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6).toFixed(3);
        global.fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const url = new URL(fullUrl);
        global.baseUrl = `${url.protocol}//${url.host}${url.pathname}`;
        global.currentRequest = req;
        const content=`${req.method} [${new Date().toISOString()}] ->  ${url.pathname} - ${elapsedTimeInMs} ms  ${Object.keys(req.query).length > 0 ?'- Query:' + JSON.stringify(req.query) : ''}`  ;
        const neutral_color='#00ff80ff'
        const dangerous_color='#ff0000ff'

        req.method.includes('POST','PUT','DELETE','PATCH') ?
            console.log(chalk.hex(dangerous_color)(content)) :
            console.log(chalk.hex(neutral_color)(content));
    });
    next();
};
const customLog = (req, res, next) => {
  const baseUrl= req.baseUrl || '';
  const globalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const url = new URL(globalUrl);
  const method = req.method;
  method.includes('POST','PUT','DELETE')?console.log(chalk.red(`Request URL: ${fullUrl}`)):console.log(chalk.green(`Request URL: ${fullUrl}`));
  next();
}
module.exports={
    // regularLog,
    customLog,
    loggingUrl
}