const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest, ensureAdmin } = require('../middleware/auth')
const multer = require('multer')
const upload = multer()

const Document = require('../models/Document')
const User = require('../models/User')
const Notification = require('../models/Notification')
const transporter = require('../config/nodemailer')

// @desc    Show add page
// @route   GET /documents/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('documents/add')
})

// @desc    Process add form
// @route   POST /documents
router.post('/', ensureAuth, upload.fields([{ name: 'invoiceUpload', maxCount: 1 }, { name: 'annexUpload', maxCount: 1 }]), async (req, res) => {
  try {
    const annex = req.files.annexUpload[0].buffer;
    const invoice = req.files.invoiceUpload[0].buffer;
    const status = req.body.status || 'pending'
    const createdAt = req.body.createdAt ? newDate(req.body.createdAt) : Date.now()

    
    await Document.create({
      user: req.user.id,
      annex,
      invoice,
      status: status,
      createdAt: createdAt,
    })
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show all documents by user
// @route   GET /documents
router.get('/', ensureAuth, async (req, res) => {
  try {
    const documents = await Document.find()
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean()

    res.render('documents/index', {
      documents,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Delete Document
// @route   DELETE /documents/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let document = await Document.findById(req.params.id).lean()

    if (!document) {
      return res.render('error/404')
    }

    if (document.user != req.user.id) {
      res.redirect('/documents')
    } else {
      await Document.deleteOne({ _id: req.params.id })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    User documents
// @route   GET /documents/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const documents = await Document.find({
      user: req.params.userId,
      status: 'pending',
    })
      .populate('user')
      .lean()

    res.render('documents/index', {
      documents,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

//@desc   Search documents by id
//@route  GET /documents/search/:query
router.get('/search/:query', ensureAuth, async (req, res) => {
  try{
      const documents = await Document.find({title: new RegExp(req.query.query,'i'), status: 'accepted'})
      .populate('user')
      .sort({ createdAt: 'desc'})
      .lean()
     res.render('documents/index', { documents })
  } catch(err){
      console.log(err)
      res.render('error/404')
  }
})

//@desc   Show all the pending documents to the engineers
//@route   GET /documents/user/:role
router.get('/engineer-dashboard', async (req, res) => {

  if(req.user.role !== 'Engineer') {
    return res.status(403).send('Access Denied')
  }

  try {
    const pendingDocuments = await Document.find({ status: 'pending' })
    .populate('user', 'firstName lastName')
    .lean()
    res.render('engineerDashboard', { pendingDocuments })
  } catch (err) {
    console.error(err)
    res.status(500).send('An error occurred')
  }
});

//@desc   Accept a pending document 
//@route   POST /documents/:id/accept
router.post('/:id/accept', ensureAuth, async (req, res) => {
  try {
    const result = await Document.updateOne({ _id: req.params.id }, { $set: { status: 'accepted' } })

    if (result.matchedCount === 0) {
      return res.status(404).send('Document not found')
    }

    await Notification.create({
      userId: document.user._id,
      message: `Your document has been accepted.`,
      documentId: document._id,
    })

    res.redirect('/documents/engineer-dashboard')
  } catch (err) {
    console.error(err)
    res.status(500).send('An error occurred')
  }
})

//@desc   Reject a pending document
//@route   POST /documents/:id/reject
router.post('/:id/reject', async (req, res) => {
  try {
    await Document.findByIdAndDelete(req.params.id)
    res.redirect('/documents/engineer-dashboard')
  } catch (err) {
    console.error(err)
    res.status(500).send('An error occurred')
  }
})

//@desc   Show annexes and invoices 
//@route  GET /documents/documentId/:fileType
router.get('/:documentId/:fileType', ensureAuth, async(req, res) => {
  const { documentId, fileType } = req.params

  try {
    const document = await Document.findById(documentId)

    if (!document) {
      return res.status(404).send('Document not found')
    }

    const file = fileType === 'annex' ? document.annex : document.invoice

    if (!file) {
      return res.status(404).send('File not found')
    }

    res.contentType('application/pdf')
    res.send(file)
  } catch (error) {
    console.error(error)
    res.status(500).send('Server error')
  }
})

//@desc   Show all the documents to the admins 
//@desc   GET /documents
router.get('/admin-dashboard', ensureAuth, ensureAdmin, async (req, res) => {
  try {
    const documents = await Document.find({}).populate('user').lean()
    res.render('adminDashboard', { documents })
  } catch (error) {
    console.error(error)
    res.status(500).send('Server error')
  }
})

//@desc   Show notification 
//@route  GET /notifications
router.get('/notifications', ensureAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id, status: 'unread' }).lean()
    res.json(notifications)
  } catch (err) {
    console.error(err)
    res.status(500).send('An error occurred while fetching notifications.')
  }
})

//@desc   Change notification status as read
//@route  POST/notification/:id/read
router.post('/notifications/:id/read', ensureAuth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { status: 'read' })
    res.send('Notification marked as read')
  } catch (err) {
    console.error(err)
    res.status(500).send('An error occurred')
  }
})


module.exports = router