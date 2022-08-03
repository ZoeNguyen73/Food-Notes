const userAuth = {
  isAuthenticated: (req, res, next) => {
    if (!req.session.user) {
      const url = req.originalUrl;
      console.log(`original url is ${url}`);
      res.redirect(`/users/login/?redirect=${url}`);
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