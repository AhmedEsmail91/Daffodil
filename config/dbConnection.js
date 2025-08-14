var chalk = require('chalk');
const connection=require('./../database/models');
const authenticateDB=()=>{
    connection.sequelize.authenticate()
    .then(() => {
        console.log(chalk.blue('Database connected successfully...'))
    }).catch((err) => {
        console.log(chalk.red('Error...', err))
    })
}
module.exports=authenticateDB;
