const express = require('express');
const router = express.Router();
const auth = require('../helpers/auth');

const File = require('../data/file');
const Folder = require('../data/folder');

const moment = require('moment');

//list
router.get('/list/:id?', auth, async (req, res, next) => {
    let folderid = req.params.id || null;

    let dbParent;
    if (folderid) {
        let dbFolder = await Folder.findOne({
            _id: folderid
        });
        if (dbFolder.folder) {
            dbParent = await Folder.findOne({
                _id: dbFolder.folder
            });
        }
    }

    let files = await File.find({ user: req.session.userid, folder: folderid, isDeleted: false }).sort({ name: 1 });
    let folders = await Folder.find({ user: req.session.userid, folder: folderid, isDeleted: false }).sort({ name: 1 });

    let isEmpty = false;
    if (folders.length === 0 && files.length === 0)
        isEmpty = true;


    folders = folders.map(x => {
        return {
            _id: x._id,
            name: x.name,
            createdAt: moment(x.createdAt).format('DD.MM.YYYY HH:mm:ss')
        };
    });

    files = files.map(x => {
        return {
            _id: x._id,
            name: x.name,
            ext: x.ext,
            url: `${req.protocol}://${req.host}:${process.env.PORT}/uploads/${req.session.userid}/${x._id}.${x.ext}`,
            createdAt: moment(x.createdAt).format('DD.MM.YYYY HH:mm:ss')
        };
    });

    return res.render('folder/list', { layout: 'user', folders, files, isEmpty, folderid, parent: dbParent || null });
});

//new
router.get('/new/:root?', auth, async (req, res, next) => {
    let rootid = req.params.root;
    return res.render('folder/details', { layout: 'user', rootid });
});

router.post('/new/:root?', auth, async (req, res, next) => {
    let rootid = req.params.root || null;

    let name = req.body.name;
    let error;
    if (!name)
        error = 'Numele este obligatoriu';

    let dbFolder = await Folder.findOne({ folder: rootid, name: name, user: req.session.userid, isDeleted: false });
    if (dbFolder)
        error = 'Exista deja un director cu acelasi nume in cadrul directorului curent';

    if (error)
        return res.render('folder/details', { layout: 'user', error, rootid });

    await (new Folder({
        name: name,
        createdAt: new Date(),
        timestamp: new Date(),
        isDeleted: false,
        folder: rootid || null,
        user: req.session.userid
    }).save());

    return res.redirect('/folder/list/' + (rootid || ''));
});

//edit
router.get('/edit/:id', auth, async (req, res, next) => {
    let id = req.params.id;
    let dbFolder = await Folder.findOne({ _id: id, user: req.session.userid });
    if (!dbFolder)
        return res.redirect('/folder/list');

    return res.render('folder/details', { layout: 'user', name: dbFolder.name, rootid: dbFolder.folder });
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
        error = 'Exista deja un director cu acelasi nume in cadrul directorului curent';

    if (error)
        return res.render('folder/details', { layout: 'user', error, folderid: id });

    dbFolder.name = name;
    dbFolder.timestamp = new Date();

    await dbFolder.save();

    return res.redirect('/folder/list/' + (dbFolder.folder || ''));
});

router.get('/delete/:id', auth, async (req, res, next) => {
    let id = req.params.id;
    let dbFolder = await Folder.findOne({ _id: id, user: req.session.userid });
    if (!dbFolder)
        return res.redirect('/folder/list');

    let root = dbFolder.folder || '';
    dbFolder.isDeleted = true;

    await dbFolder.save();

    return res.redirect('/folder/list/' + root);
});

module.exports = router;