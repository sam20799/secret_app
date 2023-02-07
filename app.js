require('dotenv').config()                  // require this at top of your app.it will keep your passwords, API KEYS and secrets inside (.env) hidden when pushed to github
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const mongoDB = "mongodb://127.0.0.1:27017/userDB";
mongoose.set('strictQuery', true);
const md5 = require("md5");                          // using md5 for encryption it uses hash function and converts you password into hash which it irreversible this hash will never turned back to original password || so we'll now storing hash during register and in login we'll compare hash

const app = express();

//sconsole.log(process.env.SECRET);                           // this is how you can access particular key from env variable

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));

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


const User = mongoose.model("user",userSchema);




app.get("/", function(req,res){
    res.render("home");
});

app.get("/login", function(req,res){
    res.render("login");
});

app.get("/register", function(req,res){
    res.render("register");
});

app.post("/register",function(req,res){                      // from register page collecting new user email and pass in database
    const newUser = User({
        email: req.body.username,
        password: md5(req.body.password)                   // converted pass from user into a hash by using md5 hash function now as password hash will be stored in database
    });

    newUser.save(function(err){
        if(err){
            console.log(err);
        }else{
            res.render("secrets");                        // Notice : here we're only rendering secrete page once user successfully registered
        }
    });
});


app.post("/login", function(req,res){
    const username = req.body.username;                         // current given email
    const password = md5(req.body.password);                        // at loing we converted pass into hash and comparing it with previous stored hash for same email 

    User.findOne({email: username},function(err,foundUser){
        if(err){
            console.log(err);
        }else{
            if(foundUser){                                         // if we found email in database then
                if(foundUser.password === password){               // check do that email's password is equal to current given pass if so then alllow them to goto secrete page
                    res.render("secrets");
                }
            }
        }
    });
});


app.listen(3000, function(){
    console.log("Server is running on port 3000");
});