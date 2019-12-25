// Import modules

var express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    queryString = require("querystring"), 
    request = require("request"),
    timeout = require("connect-timeout");

// Application setup

var app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(timeout("60s"));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://utkarsh:sona2503@cluster0-0cl3l.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true , useUnifiedTopology: true});


var saltRounds = 8;
var session = [];

// Models

var questionSchema = new mongoose.Schema({
    question_content: {type:String, default:"Question Content"}
});

var choicesSchema = new mongoose.Schema({
    choice_content: {type: String, default:"Choice Content"},
    votes: {type: Number, default:0},
    question_id: {type: String, default:null}
});

var Question = mongoose.model("Question", questionSchema);
var Choices = mongoose.model("Choices", choicesSchema);

// Routes
// ===========================================================

app.get("/", function (req, res) {
    res.render("landing");
});

// GET Index

app.get("/index", function (req, res) {
    Question.find({}, function(err, questions) {
        if (err) {
            console.log(err);
        }
        else {
            // console.log(questions);

            // console.log(this.choices);

            Choices.find({}, function(err, choices) {
                if (err) {
                    console.log(err); 
                }
                else {
                    res.render("index", { questions: questions, choices: choices });
                }
            });
        }
    });
});

app.get("/new", function (req ,res) {
    res.render("new");
});

app.post("/new", function (req, res) {
    var question = req.body.question;
    var choices = [req.body.choice1, req.body.choice2, req.body.choice3, req.body.choice4];

    // console.log(question);

    Question.create({
        question_content: question
    }, function(err, question) {
        if (err) {
            console.log(err);
        }
        else {
            var i = 0;
            for (i = 0; i < 4; i++) {
                Choices.create({
                    choice_content: choices[i],
                    votes: 0,
                    question_id: question._id
                });
            }
            res.redirect(302, "/index");
        }
    });
});

app.get("/vote/:choice_id", function(req, res) {
    Choices.find({
        _id: req.params.choice_id
    }, function(err, choice) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(choice);
            var updatedVotes = Number(choice[0].votes) + 1;
            console.log(updatedVotes);
            Choices.findByIdAndUpdate(
                req.params.choice_id,
            {  $set  :    { votes: updatedVotes}}, function(err, choice) {
                if (err) {
                    console.log(err ); 
                }
                else {
                    console.log(choice);
                }
            });
            res.redirect(302, "/index");
        }
    });
});



// ===========================================================

var port = process.env.PORT || 8000;

app.listen(port, process.env.IP, function (req, res) {
    console.log("The Polls App has started!!!!");
});