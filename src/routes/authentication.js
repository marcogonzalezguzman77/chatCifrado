const express = require('express');
const router = express.Router();

const passport = require('passport'); //traemos la biblioteca de passport
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth'); //metodo para proteger rutas de la navegacion en paginas sin sigin

router.get('/signup', isNotLoggedIn, (req,res) => {
  res.render('auth/signup')
});


router.post('/signup', isNotLoggedIn, passport.authenticate('local.signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true
}));

router.get('/signin', isNotLoggedIn, (req,res) => {
  res.render('auth/signin')
});

router.post('/signin', isNotLoggedIn, (req, res, next) => {

  passport.authenticate('local.signin', {
      successRedirect: '/profile',
      failureRedirect: '/signin',
      failureFlash: true
  })(req, res, next);
});


router.get('/profile', isLoggedIn, (req,res) => {
  //res.send('este es tu Profile')
  res.render('profiles');
});

router.get('/logout', (req,res) => {
  req.logOut(); //logOut() es metodo de passport
  res.redirect('/signin');
});

module.exports = router;
