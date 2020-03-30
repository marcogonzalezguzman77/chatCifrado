const mysql = require('mysql');
const { promisify }  = require('util'); //callbacks a promesas

const { database } = require('./keys');

const pool = mysql.createPool(database); //tener hilos que se ejecutan tareas independientes

pool.getConnection((err, connection) => { //para no llamarlo a cada rato si no lo llamo cuando lo necesito
  if (err){
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('DATABASE CONNECTION WAS CLOSED');
    }
    if (err.code === 'ER_CON_COUNT_ERROR'){
      console.error('DATABASE HAS TO MANY CONNECTIONS');
    }
    if (err.code === 'ECONNREFUSED'){
      console.error('DATABASE CONNECTION WAS REFUSED');
    }
  }

  if (connection) connection.release(); //inicio la conexion
  console.log('DB is Connected');
  return;
});

// convirtiendo promesas lo que antes eran callbacks
pool.query = promisify(pool.query); //async away , puedo utilizar promesas

module.exports = pool;

//existe un modulo que permite convertir modulo de callbacks a modulo de promesas
