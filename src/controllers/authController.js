import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isAdmin: false,
      favs: [],
    });

    await newUser.save();

    res.status(201).json({ message: "User registered" });
  } catch (error) {
    res.status(500).json({ message: "Registration error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES },
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES },
    );

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Login error" });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "No refresh token" });
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: "Invalid refresh token" });
        }

        const newAccessToken = jwt.sign(
          { id: decoded.id },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: process.env.ACCESS_TOKEN_EXPIRES },
        );

        res.json({
          accessToken: newAccessToken,
        });
      },
    );
  } catch (error) {
    res.status(500).json({ message: "Refresh error" });
  }
};
