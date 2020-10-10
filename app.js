const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const methodOverride = require("method-override");

const Hike = require("./models/hike");
const Comment = require("./models/comment");
const User = require("./models/user");

const commentRoutes = require("./routes/comments");
const hikeRoutes = require("./routes/hikes");
const indexRoutes = require("./routes/index");
// APP CONFIG

mongoose
  .connect("mongodb://localhost:27017/birdproject", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));
mongoose.set("useFindAndModify", false);
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.use(methodOverride("_method"));

// PASSPORT INITIALIZATION
app.use(
  require("express-session")({
    secret: "the speed of michael grabner",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});
app.use(indexRoutes);
app.use("/hikes", hikeRoutes);
app.use("/hikes/:id/comments", commentRoutes);
app.listen(3000, () => {
  console.log("Server Running on Port 3000");
});
