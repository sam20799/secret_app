require('dotenv').config()                  // require this at top of your app.it will keep your passwords, API KEYS and secrets inside (.env) hidden when pushed to github
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const mongoDB = "mongodb://127.0.0.1:27017/userDB";
mongoose.set('strictQuery', true);
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { Passport } = require('passport');

const app = express();

//sconsole.log(process.env.SECRET);                           // this is how you can access particular key from env variable

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({                                          //created a session with our authincation key
    secret: "Our Little Secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());                           // initialize above session
app.use(passport.session());                              // using passport session

mongoose.connect(mongoDB,(err)=>{
    if(err){
        console.log(err);
    }else{
        console.log("MongoDB is connected");
    }
});

const {Schema} = mongoose;                         // we wrote proper way to describe a schema to use encryption in it

const userSchema = new Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);                     //plugin is to hash and salt our password


const User = mongoose.model("user",userSchema);

passport.use(User.createStrategy());                           // tis 3 is to create  and destroy cookie 
passport.serializeUser(User.serializeUser());                  // create and store browser info in cookie
passport.deserializeUser(User.deserializeUser());              // is to destroy an know cookie info



app.get("/", function(req,res){
    res.render("home");
});

app.get("/login", function(req,res){
    res.render("login");
});

app.get("/register", function(req,res){
    res.render("register");
});

app.get("/secrets",function(req,res){                     // in here we check whether an user is havig active session if so then render secrete page else send them to login page
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login")
    }
});

app.get("/logout", function(req,res){                       //once user click on logout in html logout button will send user to  /logout route (don't look for logout page cuz button send it to route) 
    req.logout(function(err){                               // logout function from passport will deserialized i.e breake the cookie cuz we're login out and dont want our browser to continue session anymore
        if(err){                                            // logout function requires a callback function
            console.log(err);
        }else{
            res.redirect("/");                                     // after logout redirected to home route 

        }
    });                                           
});

app.post("/register",function(req,res){                      // from register page collecting new user email and pass in database
   User.register({username: req.body.username}, req.body.password, function(err,user){
    if(err){
        console.log(err);
        res.redirect("/register");
    }else{
        passport.authenticate("local")(req,res,function(){
            res.redirect("/secrets");
        });
    }
   });
});

// above post mehtode we save user's username and hash and salte password  once our credientials is saved successfully on our db
// then redirect to app.get ("/secrete") secrete route there cookie will verify whether you have an active connection if so then it will send you to secrete page
// and your session will keep running i.e you dont hv to login again next time you visit this page until unless you close your browser
// if there is any err on storing you data in database then you will be agin redirected to register page.



app.post("/login", function(req,res){
    
    const user = User({                                   //we need to store user detail in mongodb schema format so that we can match that credintial with database
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){                         // only this passport line will match the credentials with our database
      if(err){
        console.log(err);
      }else{
        passport.authenticate("local")(req,res,function(){         //once user verified create cookie and send it to /secrets route i.e app.get(/secrets)  where your active connection will be verified and keep you session active until you dont close your browser
            res.redirect("/secrets");
        });
      }
    });
});


app.listen(3000, function(){
    console.log("Server is running on port 3000");
});