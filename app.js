const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
const app = express();

app.set("view engine",'ejs');
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
    secret:"ThisIsSecretString",
    resave:false,
    saveUninitialized: false,
    cookie : {
        maxAge: 1000* 60 * 60 *24 * 365
    }
}));

app.use(passport.initialize()); //initializes passport
app.use(passport.session());    //begins session

mongoose.set('useNewUrlParser', true); //remove deprecation warning
mongoose.set('useFindAndModify', false); //remove deprecation warning
mongoose.set('useCreateIndex', true); //remove deprecation warning
mongoose.set('useUnifiedTopology',true);//remove deprecation warning
mongoose.connect('mongodb://localhost:27017/dashboard');

const userSchema = new mongoose.Schema({
    username:String
})

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('userAccount',userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) { //sets user id as cookie in browser
    done(null, user.id);
});

passport.deserializeUser(function(id, done) { //gets id from cookie and then user is fetched from database
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

app.get("/",(req,res)=>{
    if(req.isAuthenticated()){
        res.redirect("/home");
    }
    res.render("index");
})

app.get("/home",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("dashboard");
    }
})

app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
})
app.post("/",(req,res)=>{
    
    passport.authenticate('local',{failureRedirect:"/"})(req,res,()=>{
        res.redirect("/home");
    })
})
app.listen(3000,()=>{
    console.log("Server is running at port 3000");
})