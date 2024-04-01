require('dotenv').config({ path: './config/.env' })

const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest, ensureAdmin } = require('../middleware/auth')
const multer = require('multer')
const upload = multer()
const path = require('path')

const Document = require('../models/Document')
const User = require('../models/User')
const Notification = require('../models/Notification')
const {sendEmail} = require('../config/nodemailer')
const PDFDocument = require('pdfkit')
const fs = require('fs')
const { dirname } = require('path')

// @desc    Show add page
// @route   GET /documents/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('documents/add')
})

// @desc    Process add form
// @route   POST /documents
router.post('/', ensureAuth, upload.single('annexUpload'), async (req, res) => {
  try {
    const annex = req.file.buffer
    const status = req.body.status || 'pending'
    const createdAt = req.body.createdAt ? newDate(req.body.createdAt) : Date.now()

    const doc = new PDFDocument()
    let buffers = []
    doc.on('data', buffers.push.bind(buffers))
    doc.on('end', async() => {
      let invoicePdfBuffer = Buffer.concat(buffers)

      await Document.create({
        user: req.user.id,
        annex,
        invoice: invoicePdfBuffer,
        status: status,
        createdAt: createdAt,
      })
      res.redirect('/dashboard')
    })

    let y = 60
    const lineSpacing = 15
    const horizontalLineStart = 50
    const horizontalLineEnd = 550

    const projectPeriod = req.body.projectPeriod
    const totalSum = req.body.totalSum

    doc.fontSize(16).text('Invoice', {align: 'center'})
    doc.moveDown()

    const addSection = (title, y) => {
      doc.fontSize(14).text(title, 50, y, {underline: true});
      return y + 20;
    };

    //Contractor information
    y = addSection('Contractor Information', y)
    doc.fontSize(12).text(`Contractor: ${req.body.contractor}`, 100, y);
    y += lineSpacing
    doc.text(`MX and Address: ${req.body.MXandAddress}`, 100, y);
    y += lineSpacing
    doc.text(`YU and Address: ${req.body.YUandAddress}`, 100, y);
    y += lineSpacing


    y += lineSpacing
    doc.moveTo(horizontalLineStart, y).lineTo(horizontalLineEnd, y).stroke()
    y += lineSpacing

    //Contracting authority info
    y = addSection('Contracting Authority', y)
    doc.text(`Contracting Authority: ${req.body.contractingAuthority}`, 100, y);
    y += lineSpacing
    doc.text(`Authority Address 1: ${req.body.authorityAddress1}`, 100, y);
    y += lineSpacing
    doc.text(`Authority Address 2: ${req.body.authorityAddress2}`, 100, y);
    y += lineSpacing
    doc.text(`Authority Address 3: ${req.body.authorityAddress3}`, 100, y);
    y += lineSpacing
    doc.text(`City and ZIP: ${req.body.cityZip}`, 100, y);
    y += lineSpacing
    doc.text(`Country: ${req.body.country}`, 100, y);
    y += lineSpacing
    doc.text(`Engineer: ${req.body.engineer}`, 100, y);
    y += lineSpacing
    doc.text(`Final Beneficiary: ${req.body.finalBeneficiary}`, 100, y);
    y += lineSpacing
    doc.text(`End Recepient: ${req.body.endRecepient}`, 100, y);
    y += lineSpacing

    y += lineSpacing
    doc.moveTo(horizontalLineStart, y).lineTo(horizontalLineEnd, y).stroke()
    y += lineSpacing

    //Financial and date info
    y = addSection('Project Periods', y)
    doc.text(`Period Of Valuation Start: ${req.body.periodOfValuationStart}`, 100, y);
    y += lineSpacing
    doc.text(`Period Of Valuation End: ${req.body.periodOfValuationEnd}`, 100, y);
    y += lineSpacing
    doc.text(`Date of Application for Interim Payment: ${req.body.interimPaymentDate}`, 100, y);
    y += lineSpacing
    doc.text(`Date of Commence: ${req.body.commenceDate}`, 100, y);
    y += lineSpacing
    doc.text(`Original Completion Date: ${req.body.originalCompletionDate}`, 100, y);
    y += lineSpacing
    doc.text(`Extended Completion Date: ${req.body.extendedCompletionDate}`, 100, y);
    y += lineSpacing

    y += lineSpacing
    doc.moveTo(horizontalLineStart, y).lineTo(horizontalLineEnd, y).stroke()
    y += lineSpacing

    y = addSection('Financial Details', y)
    doc.text(`Advance Payment Guarantee Value (EUR): ${req.body.advancePaymentGuaranteeValue}`, 100, y);
    y += lineSpacing
    doc.text(`Advance Payment Guarantee Expiry Date: ${req.body.advancePaymentGuaranteeExpiry}`, 100, y);
    y += lineSpacing
    doc.text(`Performance Guarantee Value (EUR): ${req.body.performanceGuaranteeValue}`, 100, y);
    y += lineSpacing
    doc.text(`Performance Guarantee Value Expiry Date: ${req.body.performanceGuaranteeValueExpiry}`, 100, y);
    y += lineSpacing
    doc.text(`Retention Money Bond Value (EUR): ${req.body.retentionMoneyBondValue}`, 100, y);
    y += lineSpacing
    doc.text(`Retention Money Bond Value Expiry Date: ${req.body.retentionMoneyBondExpiry}`, 100, y);
    y += lineSpacing
    doc.text(`Rest of Retention Money Bond Value (EUR): ${req.body.restRetentionMoneyBondValue}`, 100, y);
    y += lineSpacing
    doc.text(`Contracted Sum Excluding Provisional Sum (EUR): ${req.body.contractedSumExProvisionalValue}`, 100, y);
    y += lineSpacing
    doc.text(`Addendum no. 1: ${req.body.addendum1}`, 100, y);
    y += lineSpacing
    doc.text(`Authorized Variation Orders (EUR): ${req.body.authorizedVariationOrders}`, 100, y);
    y += lineSpacing
    doc.text(`Accepted Contract Sum Including Addendum no. 1 (EUR): ${req.body.acceptedSumInclAddendum1}`, 100, y);
    y += lineSpacing
    doc.text(`Actual Progress: ${req.body.actualProgress}`, 100, y);
    y += lineSpacing

    y += lineSpacing
    doc.moveTo(horizontalLineStart, y).lineTo(horizontalLineEnd, y).stroke()
    y += lineSpacing

    //Summary
    y = addSection('Summary', y)
    doc.text(`For the Period: ${projectPeriod}`, 100, y);
    y += lineSpacing
    doc.text(`Contract Ammount as Letter of Acceptance: ${totalSum}`, 100, y);
    y += lineSpacing

    const stampPath = path.join(__dirname, '../public/images/Stamp.jpg')
    doc.image(stampPath, 450, y, {width: 100})
    y += 100

    doc.moveTo(50, 750).lineTo(550, 750).stroke();

    // Footer
    doc.fontSize(10).text('This is a computer-generated document and does not require a signature.', 50, 760);

    doc.end()
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
    const result = await Document.updateOne({ _id: req.params.id }, { $set: { status: 'accepted' } }).populate('user')

    if (result.matchedCount === 0) {
      return res.status(404).send('Document not found')
    }

    
    await sendEmail ({
    to: "matejadudvarski@gmail.com",
    subject: "Your document has been accepted.",
    text: "Your document has been reviewed and accepted by an engineer.",
    html: "<b>Your document has been reviewed and accepted by an engineer. </b>"
    })
  

    console.log('Email sent successfully')
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
    const result = await Document.updateOne({ _id: req.params.id }, { $set: { status: 'rejected' } })

    if (result.matchedCount === 0) {
      return res.status(404).send('Document not found')
    }
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