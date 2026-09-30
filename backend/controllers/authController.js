import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/userModel.js"

// Create JWT token for logged in user
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// Check username and password
const validateUserInput = (username, password) => {
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !username.trim() ||
    !password
  ) {
    return "Username and password are required";
  }

  if (username.trim().length < 3 || username.trim().length > 30) {
    return "Username must be between 3 and 30 characters";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  return null;
};

// Registeruser
const signup = async (req, res) => {
  try {
    const { username, password } = req.body

    const validationError = validateUserInput(username, password)

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const cleanUsername = username.trim();

    //username already taken
    const existingUser = await User.findOne({
      username: cleanUsername,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username already exists"
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      username: cleanUsername,
      password: hashedPassword,
    });

    const token = generateToken(user)

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        username: user.username
      },
    });
  } catch (error) {
    // duplicate username
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      })
    }

    console.error("Signup error:", error.message)

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
};

// login user
const login = async (req, res) => {
  try {
    const { username, password } = req.body

    const validationError = validateUserInput(username, password)

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    // Find user and password hash
    const user = await User.findOne({
      username: username.trim()
    }).select("+password")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    // Check entered password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    const token = generateToken(user)

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username
      },
    })
  } catch (error) {
    console.error("Login error:", error.message)

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
};

const authController = { signup,login}

export default authController
