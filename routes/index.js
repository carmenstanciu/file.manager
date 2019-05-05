const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('index', { isLoggedIn: req.session.isLoggedIn});
});

module.exports = router;
