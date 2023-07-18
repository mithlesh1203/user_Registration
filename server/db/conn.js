const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const mysql = require('mysql');

//connection to database
const db = mysql.createConnection({ 
host: process.env.MYSQL_HOST,
 user: process.env.MYSQL_USER,
 password: process.env.MYSQL_PASSWORD,
 database: process.env.MYSQL_DATABASE, 
})

db.connect((err) => { 
if(err){ 
  return console.log('Unable to connect to database')
 }else{
return console.log('connect to database')
}
});

module.exports=db;