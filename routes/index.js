const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

// route route
router.get("/", (req, res) => {
  res.render("landing");
});

// *****************
// AUTH ROUTES
// *****************
// register form
router.get("/register", (req, res) => {
  res.render("register");
});

// handle sign up logic
router.post("/register", async (req, res) => {
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

// login form
router.get("/login", (req, res) => {
  res.render("login");
});

// login create
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/hikes",
    failureRedirect: "/login",
  }),
  (req, res) => {}
);

// logout
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/hikes");
});

// middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

module.exports = router;