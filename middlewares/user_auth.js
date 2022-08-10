const userAuth = {
  isAuthenticated: (req, res, next) => {
    if (!req.session.user) {
      res.render('users/login', {redirect: req.originalUrl, errMsg: 'Please log in to continue'});
      return;
    };
    
    next();
  },

  isAuthorised: (req, res, next) => {
    if (req.session.user !== req.params.username) {
      res.render('users/login', {errMsg:`Sorry, you are not authorized to see this page`});
      return;
    };
    next();
  },

  setAuthUser: (req, res, next) => {
    res.locals.authUser = null;
    
    if (req.session.user) {
      res.locals.authUser = req.session.user;
    };

    next();
  }
};

module.exports = userAuth;