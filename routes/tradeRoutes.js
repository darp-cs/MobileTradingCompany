const express = require('express');
const router = express.Router();
const controller = require('../controllers/tradeController');
const { isLoggedIn, isHost } = require('../middlewares/auth');

// route for home page
router.get('/', controller.homepage);

//route to display page for creating new entry
router.get('/new', isLoggedIn, controller.newMobile);

//route to create new mobile entry
router.post('/', isLoggedIn,  controller.createNewEntry);

//route to display the list of mobiles
router.get('/:id', controller.showMobileDetail);

//to display the edit page
router.get('/:id/edit', isLoggedIn, isHost, controller.editMobile);

//to update the mobile 
router.put('/:id', isLoggedIn, isHost, controller.updateMobile);

//to delete the mobile
router.delete('/:id', isLoggedIn, isHost, controller.deleteMobile);


router.post('/:id/interested', isLoggedIn, controller.follow);

router.post('/:id/notinterested', isLoggedIn, controller.unfollow);

router.post('/:id/tradeitem',  isLoggedIn, controller.startTrade);

router.post('/:id/tradeoffered', isLoggedIn, controller.tradeoffered);

router.post('/:id/offercancel',  isLoggedIn, controller.offercancel);

router.post('/:id/manageOffer',  isLoggedIn, controller.manageOffer);

router.post('/:id/acceptOffer',  isLoggedIn, controller.acceptOffer);

router.post('/:id/rejectOffer',  isLoggedIn, controller.rejectOffer);


module.exports=router;  