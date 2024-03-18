const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')

const Document = require('../models/Document')

// @desc    Login/Landing page
// @route   GET /
router.get('/', ensureGuest, (req, res) => {
  res.render('loginView', {
    layout: 'login',
  })
})

// @desc    Dashboard
// @route   GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user.id }).lean()
    res.render('dashboardView', {
      name: req.user.firstName,
      documents,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

module.exports = router