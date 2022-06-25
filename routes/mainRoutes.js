const express = require('express');
const router = express.Router();
const mController = require('../controllers/mainController');


//GET /: redirects to the home page
router.get('/', mController.homePage);

//GET /contact: redirects to the contact page
router.get('/contact', mController.contactPage);

//POST /about: redirects to the about page
router.get('/about', mController.aboutPage);

module.exports=router;  