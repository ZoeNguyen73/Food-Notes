const userAuth = {
  isAuthenticated: (req, res, next) => {
    if (!req.session.user) {
      const url = req.originalUrl;
      res.redirect(`/login?redirect=${url}`);
      return;
    };
    
    next();
  },

  isAuthorised: (req, res, next) => {
    if (req.session.user !== req.params.username) {
      res.render('users/login', {errMsg:`Sorry, you are not authorized to see this page`, redirect:null});
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