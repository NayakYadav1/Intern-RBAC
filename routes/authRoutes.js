const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post("/logout", AuthController.logout);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

router.get("/session", (req, res) => {
    if (req.session.user) {
      res.json({ message: "User is logged in", user: req.session.user });
    } else {
      res.json({ message: "No active session" });
    }
  });

module.exports = router;