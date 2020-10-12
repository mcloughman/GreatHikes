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
  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      req.flash("error", err.message);
      return res.redirect("/register");
    }
    passport.authenticate("local")(req, res, function () {
      req.flash("success", "Welcome to Great Hikes " + user.username);
      res.redirect("/hikes");
    });
  });
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
  req.flash("success", "Logged Out");
  res.redirect("/hikes");
});

module.exports = router;
