const express = require('express');
const router = express.Router();
const Auth = require('../middleware/auth');

router.post('/purchase/course/:id', Auth, (req, res) => {

});

module.exports = router;