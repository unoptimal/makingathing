const express = require('express')
const router = express.Router();
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')

router.get('/register', (req, res) =>{
    res.render('users/register')
})

router.post('/register', catchAsync(async(req, res, next)=>{
    try{
    const {email, username, password} = req.body;
    const user = new User({email, username});
    const newUser = await User.register(user, password);
    req.login(newUser, err => {
        if(err) return next(err);
        req.flash('success', 'welcome! go make something')
        res.redirect('/ideas')
    })

    } catch(e){
        req.flash('error', e.message)
        res.redirect('register')
    }
}))

router.get('/login', (req, res) =>{
    res.render('users/login')
})

router.get('/logout', (req, res) =>{
    req.logout();
    req.flash('success', 'logged out. come back soon')
    res.redirect('/')
})

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) =>{
    req.flash('success', 'welcome back! go make something')
    const redirectUrl = req.session.returnTo || '/ideas';
    delete req.session.returnTo;
    res.redirect(redirectUrl)
})

module.exports = router;

