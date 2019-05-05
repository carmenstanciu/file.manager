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

    let error;
    if (!email || !pass)
        error = 'email si parola obligatorii';

    let dbUser = await User.findOne({ email: email });
    if (dbUser)
        error = 'adresa de email este deja folosita';

    if (error) {
        return res.render('account/register', {
            error: error
        });
    }

    let hash = await new Promise((resolve, reject) => {
        bcrypt.hash(pass, 12, function (err, hash) {
            if (err)
                return reject(err);

            resolve(hash);
        });
    });

    await new User({
        email: email,
        hash: hash,

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
        error = 'utilizator sau parola incorecta';
    else {
        let passCheck = await new Promise((resolve) => {
            bcrypt.compare(pass, dbUser.hash, (err, res) => {
                if (res)
                    return resolve(true);

                return resolve(false);
            });
        });

        if (!passCheck)
            error = 'utilizator sau parola incorecta';
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

    return res.redirect('/user');
});

router.get('/logout', (req, res, next) => {
    req.session.destroy();
    return res.redirect('/');
});

module.exports = router;