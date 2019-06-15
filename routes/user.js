const express = require('express');
const router = express.Router();

const User = require('../data/user');

const auth = require('../helpers/auth');
const moment = require('moment');

router.get('/', auth, async (req, res, next) => {
  let userid = req.session.userid;
  let dbUser = await User.findOne({ _id: userid });

  res.render('user/index', {
    layout: 'user', user: {
      firstname: dbUser.firstname,
      lastname: dbUser.lastname,
      address: dbUser.address,
      phone: dbUser.phone,
      memberSince: moment().diff(moment(dbUser.createdAt), 'days'),
      lastLogin: moment(dbUser.lastLogin).format('HH:mm DD.MM.YYYY')
    }
  });
});

module.exports = router;
