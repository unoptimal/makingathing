const express = require('express');
const router = express.Router();

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

const Idea = require('../models/idea');
const {isLoggedIn, isAuthor, validateIdea} = require('../middleware')


//list of all ideas
router.get('/', catchAsync(async (req, res) =>{
    const ideas = await Idea.find({});
    res.render('ideas/index', {ideas})
}))
    
//new form
router.get('/new', isLoggedIn, (req, res) => {
    res.render('ideas/new')
})

//submit form
router.post('/', isLoggedIn, validateIdea, catchAsync(async (req, res, next) =>{
    const idea = new Idea(req.body.idea);
    idea.author = req.user._id; //idea has an author who submitted. that is the user id.
    await idea.save(); 
    req.flash('success', 'submitted idea')
    res.redirect(`/ideas/${idea._id}`)
}))

//go to specific idea
//cannot set headers fuck you
router.get('/:id', catchAsync(async (req, res) =>{
    const idea = await Idea.findById(req.params.id).populate('author'); // gives us access to everything about author
    res.render('ideas/show', {idea})
}))

//show edit page of specific idea
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) =>{
    const idea = await Idea.findById(req.params.id)
    if(!idea){
        req.flash('error', 'cannot find that idea');
        return res.redirect('/ideas');
    }
    res.render('ideas/edit', {idea})
}))

//actually edit specific idea
router.put('/:id', validateIdea, isAuthor, catchAsync(async (req, res) =>{
    //const idea = await Idea.findByIdAndUpdate(req.params.id, {...req.user._id}); --> find based on Id, as well as who made the ID
    //now we check if you own the idea before you can edit / delete it 
    const idea = await Idea.findByIdAndUpdate(req.params.id, {...req.body.idea});
    req.flash('success', 'edited idea')
    res.redirect(`/ideas/${idea._id}`)
}))

router.delete('/:id', isAuthor, catchAsync(async(req, res) =>{
    const idea  = await Idea.findByIdAndDelete(req.params.id)
    req.flash('error', 'deleted idea')
    res.redirect('/ideas')
}))

module.exports = router;