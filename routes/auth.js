const express = require('express')
const passport = require('passport')
const router = express.Router()

// @desc    Auth with Google
// @route   GET /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile'] }))

// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Check user role and redirect accordingly
    switch (req.user.role) {
      case 'Engineer':
        res.redirect('/documents/engineer-dashboard')
        break
      case 'Contractor':
        res.redirect('/dashboard') 
        break
      case 'Admin':
        res.redirect('/documents/admin-dashboard') 
        break
      case 'Unassigned':
      default:
        res.redirect('/users/select-role') 
        break
    }
  }
)

// @desc    Logout user
// @route   /auth/logout
router.get('/logout', (req, res, next) => {
  req.logout((error) => {
      if (error) {return next(error)}
      res.redirect('/')
  })
})

module.exports = router