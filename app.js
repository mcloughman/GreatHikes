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

// ROUTES
// INDEX
app.get("/", (req, res) => {
  res.redirect("/hikes");
});

app.get("/hikes", async (req, res) => {
  try {
    let foundHikes = await Hike.find({});
    res.render("hikes/index", { hikes: foundHikes });
  } catch (err) {
    console.log(err);
  }
});

// NEW renders a form
app.get("/hikes/new", (req, res) => {
  res.render("hikes/new");
});

// CREATE
app.post("/hikes", async (req, res) => {
  try {
    let newHike = await Hike.create(req.body.hike);
    res.redirect("/hikes");
  } catch (err) {
    console.log(err);
  }
});

// SHOW
app.get("/hikes/:id", function (req, res) {
  Hike.findById(req.params.id)
    .populate("comments")
    .exec(function (err, foundHike) {
      if (err) {
        console.log(err);
      } else {
        res.render("hikes/show", { hike: foundHike });
      }
    });
});
// EDIT
app.get("/hikes/:id/edit", async (req, res) => {
  try {
    let foundHike = await Hike.findById(req.params.id);
    res.render("edit", { hike: foundHike });
    if (!foundHike) {
      throw "Something Went WRONG!";
    }
  } catch (error) {
    console.log("Caught", error);
    res.redirect("/hikes");
  }
});
// UPDATE
app.put("/hikes/:id", async (req, res) => {
  try {
    let updatedHike = await Hike.findByIdAndUpdate(
      req.params.id,
      req.body.hike
    );
    res.redirect("/hikes/" + req.params.id);
    if (!updatedHike) {
      throw "Failed to Update Hike";
    }
  } catch (e) {
    console.log(e);
    res.redirect("/hikes");
  }
});

//************************
// COMMENT ROUTES
//************************
app.get("/hikes/:id/comments/new", isLoggedIn, async (req, res) => {
  try {
    let foundHike = await Hike.findById(req.params.id);
    res.render("comments/new", { hike: foundHike });
    if (!foundHike) {
      throw "Can't Find Hike";
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/hikes/:id/comments", isLoggedIn, (req, res) => {
  Hike.findById(req.params.id, (err, foundHike) => {
    if (err) {
      console.log(err);
      res.redirect("/hikes");
    } else {
      Comment.create(req.body.comment, (err, comment) => {
        if (err) {
          console.log(err);
        } else {
          foundHike.comments.push(comment);
          foundHike.save();
          res.redirect("/hikes/" + foundHike._id);
        }
      });
    }
  });
});

// *****************
// AUTH ROUTES
// *****************
app.get("/register", (req, res) => {
  res.render("register");
});
// handle sign up logic
app.post("/register", async (req, res) => {
  let newUser = new User({ username: req.body.username });
  try {
    await User.register(newUser, req.body.password);
    if (!newUser) {
      throw "ERROR!";
      return res.render("register");
    }
    passport.authenticate("local")(req, res, function () {
      res.redirect("/hikes");
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/hikes",
    failureRedirect: "/login",
  }),
  (req, res) => {}
);

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/hikes");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

app.listen(3000, () => {
  console.log("Server Running on Port 3000");
});
