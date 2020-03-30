module.exports = {
    isLoggedIn (req, res, next) {
        if (req.isAuthenticated()) { //isAuthenticated es metodo de passport
            return next();
        }
        return res.redirect('/signin');
    },

    isNotLoggedIn(req, res, next) {
      if (!req.isAuthenticated()){
        return next();
      }
      return res.redirect('/profile');
    }

};
