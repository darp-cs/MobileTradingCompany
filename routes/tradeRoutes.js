const express = require('express');
const router = express.Router();
const controller = require('../controllers/tradeController');
const { isLoggedIn, isHost } = require('../middlewares/auth');

//GET /connections: send all connections to the user
router.get('/', controller.index);

//GET /connections/new: send html form for creating a new connection
router.get('/new', isLoggedIn, controller.new);

//POST /connections: create a new connection
router.post('/', isLoggedIn, controller.create);

//GET /connections/:id: send details of connection identified by id
router.get('/:id',  controller.show);

//GET /connections/:id: send html form for editing an existing connection
router.get('/:id/edit',  isLoggedIn, isHost, controller.edit);

//PUT /connections/:id: update the connection identified by id
router.put('/:id',  isLoggedIn, isHost, controller.update);

//DELETE /connections/:id: delete the connection identified by id
router.delete('/:id',  isLoggedIn, isHost, controller.delete);


router.post('/:id/interested',  isLoggedIn, controller.interested);

router.post('/:id/notinterested',  isLoggedIn, controller.notinterested);

router.post('/:id/tradeitem',  isLoggedIn, controller.tradeitem);

router.post('/:id/tradeoffered', isLoggedIn, controller.tradeoffered);

router.post('/:id/offercancel',  isLoggedIn, controller.offercancel);

router.post('/:id/manageOffer',  isLoggedIn, controller.manageOffer);

router.post('/:id/acceptOffer',  isLoggedIn, controller.acceptOffer);

router.post('/:id/rejectOffer',  isLoggedIn, controller.rejectOffer);


module.exports=router;  