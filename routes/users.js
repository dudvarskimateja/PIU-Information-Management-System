const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const User = require('../models/User');


//@desc Show select role page
//@desc GET /user/select-role
router.get('/select-role', ensureAuth, (req, res) => {
  res.render('selectRole')
})

//@desc Update user role
//@desc POST /user/select-role
router.post('/select-role', ensureAuth, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { role: req.body.role } },
      { new: true } // Return the updated document
    )

    // Redirect based on the newly selected role
    switch (updatedUser.role) {
      case 'Engineer':
        res.redirect('/documents/engineer-dashboard')
        break;
      case 'Contractor':
        res.redirect('/dashboard')
        break;
      case 'Admin':
        res.redirect('/admin-dashboard')
        break;
      default:
        res.redirect('/select-role'); // Redirect to a default page if role doesn't match
        break;
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating user role')
  }
})

module.exports = router;