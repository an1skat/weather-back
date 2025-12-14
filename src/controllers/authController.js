import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const auth = async (req, res) => {
	try {
		const { name, email, password } = req.body;
		
		const existingUser = await User.findOne({ email });
		
		if (existingUser) {
			const isMatch = await bcrypt.compare(password, existingUser.password);
			if (!isMatch) {
				return res.status(400).json({ message: "Invalid password" });
			}
			
			const accessToken = jwt.sign(
				{ id: existingUser._id },
				process.env.ACCESS_TOKEN_SECRET,
				{ expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
			);
			
			const refreshToken = jwt.sign(
				{ id: existingUser._id },
				process.env.REFRESH_TOKEN_SECRET,
				{ expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
			);
			
			return res
				.cookie("refreshToken", refreshToken, {
					httpOnly: true,
					sameSite: "lax",
					maxAge: 7 * 24 * 60 * 60 * 1000,
				})
				.status(200)
				.json({
					message: "Login successful",
					user: {
						name: existingUser.name,
						email: existingUser.email,
						favs: existingUser.favs,
					},
					accessToken,
				});
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
		
		const accessToken = jwt.sign(
			{ id: newUser._id },
			process.env.ACCESS_TOKEN_SECRET,
			{ expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
		);
		
		const refreshToken = jwt.sign(
			{ id: newUser._id },
			process.env.REFRESH_TOKEN_SECRET,
			{ expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
		);
		
		return res
			.cookie("refreshToken", refreshToken, {
				httpOnly: true,
				sameSite: "strict",
				maxAge: 7 * 24 * 60 * 60 * 1000,
			})
			.status(201)
			.json({
				message: "User registered",
				user: {
					name: newUser.name,
					email: newUser.email,
					favs: newUser.favs,
				},
				accessToken,
			});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Server error" });
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
