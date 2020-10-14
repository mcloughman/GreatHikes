const Comment = require("../models/comment");
const Hike = require("../models/hike");
// All middleware goes

const middlewareObj = {};

middlewareObj.checkCommentOwnership = function (req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
      if (err || !foundComment) {
        res.redirect("back");
      } else {
        // does user own the comment?
        if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
          next();
        } else {
          req.flash("error", "You don't have permission to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
};

middlewareObj.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "Please Login First!");
  res.redirect("/login");
};

middlewareObj.isAdmin = function (req, res, next) {
  if (req.user.isAdmin) {
    return next();
  }
  req.flash("error", "You do not have access to do that.");
  res.redirect("/hikes");
};

module.exports = middlewareObj;
