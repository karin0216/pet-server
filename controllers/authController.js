require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const validation = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send("All input is required");
    }

    const oldUser = await User.find({ email: email });
    if (oldUser.length) {
      return res.status(409).send("User already exists. Please Login");
    }

    res.status(200).send({ email: email, password: password });
  } catch (err) {
    console.log(err);
    res.status(403).send("Invalid User");
  }
};

const signUp = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      description,
      profile_picture,
      type,
      interests,
    } = req.body;

    encryptedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username,
      email: email.toLowerCase(),
      password: encryptedPassword,
      description: description,
      profile_picture: profile_picture,
      type: type,
      interests: interests,
    });

    const token = jwt.sign(
      { user_id: user._id },
      process.env.ACCESS_TOKEN_SECRET
    );

    user.token = token;

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).send("Sign-up Failed");
    console.log(err);
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send("All input is required");
    }

    const user = await User.findOne({ email: email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id },
        process.env.ACCESS_TOKEN_SECRET
      );
      res.status(200).json({ user, token });
    } else {
      res.status(400).send("Invalid Credentials");
    }
  } catch (err) {
    res.status(500).send("Sign-in Failed");
    console.log(err);
  }
};

const verify = (req, res) => {
  res.status(200).send("Welcome 🙌 ");
};

const verifyAndGetUser = async (req, res) => {
  try {
    const { user_id } = req.user;
    const user = await User.findById(user_id);
    const {
      _id,
      username,
      email,
      description,
      profile_picture,
      type,
      Carer,
      interests,
    } = user;
    res.send({
      _id,
      username,
      email,
      description,
      profile_picture,
      type,
      Carer,
      interests,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  validation,
  signIn,
  signUp,
  verify,
  verifyAndGetUser,
};
