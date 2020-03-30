const passport = require('passport'); //autenticacion con medios sociales (facebook,twitter)
const LocalStrategy = require('passport-local').Strategy; //voy a hacer una autenticacion de forma local

const pool = require('../database');
const helpers = require('./helpers');


passport.use('local.signin', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, username, password, done) => {
  console.log(req.body);
  /*console.log(req.body);
  console.log(username);
  console.log(password);*/

  const rows = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  if (rows.length > 0) { //si encontraste el usuario
    const user = rows[0];
    const validPassword = await helpers.matchPassword(password, user.password)
    if (validPassword) {
      done(null, user, req.flash('success', 'Welcome ' + user.username));
    } else {
      done(null, false, req.flash('message', 'Incorrect Password'));
    }
  } else {
    return done(null, false, req.flash('message', 'The Username does not exists.'));
  }
}));


passport.use('local.signup', new LocalStrategy({
  usernameField: 'username', //recibo el campo a traves de username
  passwordField: 'password', //recibo el campo a traves de password
  passReqToCallback: true //para recibir objeto request dentro de la funcion
}, async (req, username, password, done) => { //callback que recibe parametros
  //console.log(req.body);

  const { fullname } = req.body;
   let newUser = {
    fullname,
    username,
    password
  };
  newUser.password = await helpers.encryptPassword(password);
  // Saving in the Database
  const result = await pool.query('INSERT INTO users SET ? ', newUser);
  //console.log(result);
  newUser.id = result.insertId;
  return done(null, newUser);
}));

passport.serializeUser((user, done) => { //para guardar el usuario dentro de la sesion, done es callback
  done(null, user.id);
});


passport.deserializeUser(async (id, done) => { //utilizo el id para volver a obtener los datos
  const rows = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  done(null, rows[0]);
});
