const express = require('express');
const router = express.Router();

const auth = require('../helpers/auth');

router.get('/', auth, async (req, res, next) => {
  res.render('user/index', { layout: 'user' });
});

module.exports = router;
