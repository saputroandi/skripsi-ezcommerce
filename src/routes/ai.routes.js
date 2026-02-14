const router = require('express').Router();
const ctrl = require('../controllers/aiChat.controller');

router.post('/chat', ctrl.chat);

module.exports = router;
