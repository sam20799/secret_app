const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const mongoDB = "mongodb://127.0.0.1:27017/userDB";
mongoose.set('strictQuery', true);

const app = express();

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

const userSchema = {
    email: String,
    password: String
};

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
        password: req.body.password
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
    const password = req.body.password;                         //current given pass

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