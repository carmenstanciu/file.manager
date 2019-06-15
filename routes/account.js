const express = require('express');
const router = express.Router();
const User = require('../data/user');
const bcrypt = require('bcrypt');

router.get('/register', (req, res, next) => {
    return res.render('account/register', {});
});

router.post('/register', async (req, res, next) => {
    let email = req.body.email;
    let pass = req.body.pass;
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let address = req.body.address;
    let phone = req.body.phone;

    let error;
    if (!email || !pass || !firstname || !lastname || !address || !phone)
        error = 'Tate campurile sunt obligatorii';

    let dbUser = await User.findOne({ email: email });
    if (dbUser)
        error = 'Adresa de email este deja folosita';

    if (error) {
        return res.render('account/register', {
            error: error
        });
    }

    let hash = bcrypt.hashSync(pass, 12);

    await new User({
        email: email,
        hash: hash,

        firstname: firstname,
        lastname: lastname,

        address: address,
        phone: phone,

        createdAt: new Date(),
        isDisabled: false
    }).save();
    return res.redirect('/account/login');
});

router.get('/login', (req, res, next) => {
    return res.render('account/login', {});
});

router.post('/login', async (req, res, next) => {
    let email = req.body.email;
    let pass = req.body.pass;

    let error;
    if (!email || !pass)
        error = 'email si parola obligatorii';

    let dbUser = await User.findOne({ email: email });
    if (!dbUser)
        error = 'Utilizator sau parola incorecta';
    else {
        let passCheck = bcrypt.compareSync(pass, dbUser.hash);

        if (!passCheck)
            error = 'Utilizator sau parola incorecta';
    }

    if (error) {
        return res.render('account/login', {
            error: error
        });
    }

    dbUser.lastLogin = new Date();
    await dbUser.save();

    req.session.isLoggedIn = true;
    req.session.email = email;
    req.session.userid = dbUser._id;

    return res.redirect('/folder/list');
});

router.get('/logout', (req, res, next) => {
    req.session.destroy();
    return res.redirect('/');
});

module.exports = router;