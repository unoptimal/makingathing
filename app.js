//production
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

//express
const express = require('express')
const PORT = process.env.PORT || 3000
const app = express();

//mongoose 
const mongoose = require('mongoose');
const Idea = require('./models/idea');

// mongodb+srv://unoptimal:<password>@makingathing.cqllm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
const dbUrl = process.env.DB_URL;
//'mongodb://localhost:27017/makingathing'
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(res=>{
    console.log("DB Connected!")
}).catch(err => {
  console.log(Error, err.message);
})

//ejs
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');

//body parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

//method-override
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

//errors
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');

//flash
const flash = require('connect-flash');

//joi
const Joi = require('joi');
const {ideaSchema} = require('./schema.js')

//validate ideas
const validateIdea = (req, res, next) => {
    const result = ideaSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(result.error.details,400)
    } else{
        next();
    }
}

//sanitize
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());

//use these middlewares or functions
app.use(express.static('public')) //allow for public directories, can put custom scripts, styles, etc

//session + mongo connect + config
const session = require('express-session');
const MongoStore = require('connect-mongo');
const secret = process.env.SECRET || 'secret'

app.use(session({
    secret: 'foo',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: dbUrl,
    })
  }));

// const store = new MongoStore({
//     url: dbUrl,
//     secret,
//     touchAfter: 24 * 60 * 60
// });

// store.on("error", function (e) {
//     console.log("SESSION STORE ERROR", e)
// })

// const sessionConfig = {
//     store,
//     name: 'session',
//     secret,
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//         httpOnly: true,
//         // secure: true,
//         expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
//         maxAge: 1000 * 60 * 60 * 24 * 7
//     }
// }

// app.use(session(sessionConfig));
app.use(flash()); //req.locals makes stuff globally usable in templates

//helmet
const helmet = require('helmet')
app.use(helmet({contentSecurityPolicy: false}));

//passport config, 
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user');

//must come before flash so we can use req.isauthenticated to protect pages
app.use(passport.initialize());
app.use(passport.session()); //must come before app.use(session());
passport.use(new LocalStrategy(User.authenticate())); //use the localstrategy to authenticate our userschema

passport.serializeUser(User.serializeUser()); //storing a user in the session
passport.deserializeUser(User.deserializeUser()); //getting a user out of the session


app.use((req, res, next) =>{
    res.locals.currentUser = req.user; //(req) stores information of a user. passport deserializes it. now we can use it anywhere
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
})

//routes
const ideaRoute = require('./routes/ideas');
app.use('/ideas', ideaRoute); 
const userRoute = require('./routes/users');
app.use('/', userRoute)


// app.get('/test', async (req, res) => {
//     const idea = new Idea({author: "6265c45e431df7b775d8de20", title: 'pain', description: 'also pain', medium: 'Writing', contact: 'fucking pain'})
//     await idea.save();
//     res.send(idea)
// })

//manually create a user
// app.get('/user', async (req, res) =>{
//     const user = new User({email: 'haha@gmail.com', username: 'haha'});
//     const newUser = await User.register(user, 'haha');
//     res.send(newUser);
// })


//homepage
app.get('/', (req, res) =>{
    res.render('home')
})


app.all('*', (req, res, next) =>{
    next(new ExpressError("page not found", 404))
})

//The error gets passed down from the app.all because of next(). 
//Or from somewhere else like catchAsync. That's how we can use it in app.use
app.use((err, req, res, next) => {
    const {statusCode = 500} = err
    if(!err.message) err.message = "something went INCORRECTLY"
    res.status(statusCode).render('error', {err});
})

app.listen(PORT, (req, res) =>{
    console.log(`Listening on ${PORT}`)
})