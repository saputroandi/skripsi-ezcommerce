const router = require('express').Router();
const ctrl = require('../controllers/cart.controller');
const auth = require('../middleware/auth');

router.get('/', auth(), ctrl.getCart);
router.post('/items', auth(), ctrl.addItem);
router.patch('/items/:id', auth(), ctrl.updateItem);
router.delete('/items/:id', auth(), ctrl.removeItem);
router.post('/checkout', auth(), ctrl.checkout);

module.exports = router;
