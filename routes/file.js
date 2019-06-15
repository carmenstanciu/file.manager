const express = require('express');
const router = express.Router();
const auth = require('../helpers/auth');

const File = require('../data/file');
const Folder = require('../data/folder');
const fs = require('fs');

const moment = require('moment');

const path = require('path');

const makeDirectory = (path) => new Promise((resolve) => {
    fs.mkdir(path, (err) => {

        return resolve();
    });
});


//new
router.get('/new/:root?', auth, async (req, res, next) => {
    let rootid = req.params.root;
    return res.render('folder/file', { layout: 'user', rootid });
});

router.post('/new/:root?', auth, async (req, res, next) => {
    let rootid = req.params.root || null;

    let name = req.body.name;
    let error;

    if (!req.files || Object.keys(req.files).length == 0)
        error = 'Fisierul e obligatoriu';

    if (!name)
        error = 'Numele este obligatoriu';

    let dbFile = await File.findOne({ folder: rootid, name: name, user: req.session.userid, isDeleted: false });
    if (dbFile)
        error = 'Exista deja un fisier cu acelasi nume in cadrul directorului curent';

    if (error)
        return res.render('folder/file', { layout: 'user', error, rootid });

    let file = req.files.document;
    let ext = file.name.split('.').pop();

    let newFile = await (new File({
        name: name,
        ext: ext,
        createdAt: new Date(),
        timestamp: new Date(),
        isDeleted: false,
        folder: rootid || null,
        user: req.session.userid
    }).save());

    await makeDirectory(path.join('uploads', req.session.userid));
    await new Promise((resolve, reject) => {
        file.mv(`./uploads/${req.session.userid}/${newFile._id}.${ext}`, function (err) {
            if (err)
                return reject(err);

            return resolve();
        });
    });

    return res.redirect('/folder/list/' + (rootid || ''));
});

//edit
router.get('/edit/:id', auth, async (req, res, next) => {
    let id = req.params.id;
    let dbFile = await File.findOne({ _id: id, user: req.session.userid });
    if (!dbFile)
        return res.redirect('/folder/list');

    return res.render('folder/file', { layout: 'user', name: dbFile.name, rootid: dbFile.folder });
});

router.post('/edit/:id', auth, async (req, res, next) => {
    let id = req.params.id || null;

    let name = req.body.name;
    let error;
    if (!name)
        error = 'Numele este obligatoriu';

    let dbFolder = await Folder.findOne({ _id: id, user: req.session.userid });
    if (!dbFolder)
        return res.redirect('/folder/list');

    let dbSame = await Folder.findOne({ folder: dbFolder.folder, name: name, user: req.session.userid, isDeleted: false, _id: { $ne: id } });
    if (dbSame)
        error = 'Exista deja un folder cu acelasi nume in cadrul directorului curent';

    if (error)
        return res.render('folder/details', { layout: 'user', error, folderid: id });

    dbFolder.name = name;
    dbFolder.timestamp = new Date();

    await dbFolder.save();

    return res.redirect('/folder/list/' + (dbFolder.folder || ''));
});

router.get('/delete/:id', auth, async (req, res, next) => {
    let id = req.params.id;
    let dbFile = await File.findOne({ _id: id, user: req.session.userid });
    if (!dbFile)
        return res.redirect('/folder/list');

    let root = dbFile.folder || '';
    dbFile.isDeleted = true;

    await dbFile.save();

    return res.redirect('/folder/list/' + root);
});

module.exports = router;