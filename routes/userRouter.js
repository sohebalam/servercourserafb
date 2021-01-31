const express = require("express")
const router = express.Router()
var authenticate = require("../authenticate")
const bodyParser = require("body-parser")
const User = require("../models/userModel")
const passport = require("passport")
const cors = require("./cors")
router.use(bodyParser.json())

/* GET users listing. */
router.get(
  "/",
  cors.corsWithOptions,
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  function (req, res, next) {
    res.send("respond with a resource")
    User.find({})
      .then(
        (err, users) => {
          if (err) {
            return next(err)
          }
          res.statusCode = 200
          res.setHeader("Content-Type", "application/json")
          res.json(users)
        },
        (err) => next(err)
      )
      .catch((err) => next(err))
  }
)

router.post("/signup", cors.corsWithOptions, (req, res, next) => {
  User.register(
    new User(new User({ username: req.body.username })),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500
        res.setHeader("Content-Type", "application/json")
        res.json({ err: err })
      } else {
        if (req.body.lastname) {
          user.lastname = req.body.lastname
        }
        if (req.body.firstname) {
          user.firstname = req.body.firstname
        }
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500
            res.setHeader("Content-Type", "application/json")
            res.json({ err: err })
            return
          }
          passport.authenticate("local")(req, res, () => {
            res.statusCode = 200
            res.setHeader("Content-Type", "application/json")
            res.json({ success: true, status: "Registration Successful!" })
          })
        })
      }
    }
  )
})

router.post(
  "/login",
  cors.corsWithOptions,
  passport.authenticate("local"),
  (req, res) => {
    var token = authenticate.getToken({ _id: req.user._id })
    res.statusCode = 200
    res.setHeader("Content-Type", "application/json")
    res.json({
      success: true,
      token: token,
      status: "You are successfully logged in!",
    })
  }
)
router.get("/logout", cors.corsWithOptions, (req, res) => {
  if (req.session) {
    req.session.destroy()
    res.clearCookie("session-id")
    res.redirect("/")
  } else {
    const err = new Error("You are not logged in!")
    err.status = 403
    next(err)
  }
})

router.get(
  "/facebook/token",
  passport.authenticate("facebook-token"),
  (req, res) => {
    if (req.user) {
      var token = authenticate.getToken({ _id: req.user._id })
      res.statusCode = 200
      res.setHeader("Content-Type", "application/json")
      res.json({
        success: true,
        token: token,
        status: "You are successfully logged in!",
      })
    }
  }
)

module.exports = router
