const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");

class AuthController {
  // Register User
  async register(req, res, next) {
    try {
      const { name, email, password, confirmPassword, phone, address } =
        req.body;

      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      const hash = bcrypt.hashSync(password, 10);
      await User.create({ name, email, password: hash, phone, address });

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      next(error);
    }
  }

  // Login User
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select("+password");
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.json({ token, message: "Login successful" });
    } catch (error) {
      next(error);
    }
  }

  // Forgot Password
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      } else {
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "10m",
        });
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 600000; // 10 minutes
        await user.save();

        // Send email with reset token
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "Password Reset",
          text: `Use this token to reset your password: ${resetToken}`,
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: "Password reset token sent to your email" });
      }
    } catch (error) {
      next(error);
    }
  }

  // Reset Password
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      const hash = bcrypt.hashSync(newPassword, 10);
      user.password = hash;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({ message: "Password reset successful" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
