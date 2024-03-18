const User = require("../models/User");

module.exports = {
    ensureAuth: function (req, res, next) {
      if (req.isAuthenticated()) {
        return next()
      } else {
        res.redirect('/')
      }
    },
    ensureGuest: function (req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      } else {
        res.redirect('/dashboard');
      }
    },
    ensureAdmin: function(req, res, next) {
      if(!req.isAuthenticated || req.user.role !== 'Admin'){
        return res.status(403).send('Access denied, only admins are allowed')
      }
      next()
    },
  }