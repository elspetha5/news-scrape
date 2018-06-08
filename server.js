// Dependencies
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// Scraping tools
const axios = require("axios");
const cheerio = require("cheerio");

// Database
const db = require("./models");

const PORT = process.env.PORT || 3000;

const app = express();

// Set Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Set Handlebars
const exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/news-scrape";
mongoose.connect(MONGODB_URI);

app.get("/", function(req, res) {
    res.render("index");
})

// Scraping route
app.get("/scrape", function(req, res) {
    axios("https://www.goodnewsnetwork.org/category/news/").then(function(err, res, html) {
        const $ = cheerio.load(html);

        $(".td-model-thumb").each(function(i, element) {
            const result = {};

            result.title = $(this).children("a").attr("title");
            result.link = $(this).children("a").attr("href");
            result.pic = $(this).children("img").attr("src");

            db.Article.create(result).then(function(dbArticle) {
                console.log(dbArticle);
            })
            .catch(function(err) {
                return res.json(err);
            });
        });

        res.send("Scrape Complete");
    });
});

// Getting articles from db route
app.get("/articles", function(req, res) {
    db.Article.find({}).then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

// Getting specific article by id, populated by note route
app.get("/articles/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

// Saving/updating note route
app.post("/articles/:id", function(req, res) {
    db.Note.create(req.body).then(function(dbNote) {
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

// Start server
app.listen(PORT, function() {
    console.log("App running on port " + PORT);
});