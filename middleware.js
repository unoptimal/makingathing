const Idea = require('./models/idea');
const {ideaSchema} = require('./schema');
const ExpressError = require('./utils/ExpressError');

module.exports.isLoggedIn = (req, res, next) =>{
    if(!req.isAuthenticated()){
        //store the url they are requesting from
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'log in to see page')
        return res.redirect('/login')
    }
    next();
}

module.exports.isAuthor = async (req, res, next) => { //check to see if that is the author
    const idea = await Idea.findById(req.params.id);
    if(!idea.author.equals(req.user._id)){ 
        req.flash('error', `you can't do that`)
        res.redirect(`/ideas/${idea._id}`);
    }
    next();
}

module.exports.validateIdea = (req, res, next) =>{
    const result = ideaSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(result.error.details,400)
    } else{
        next();
    }
}

