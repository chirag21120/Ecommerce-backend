const { User } = require("../model/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sanitizeUser } = require("../services/common");
const dotenv = require("dotenv");

dotenv.config();

const secret_key = process.env.JWT_SECRET;

exports.createUser = async (req, res) => {
  try {
    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(
      req.body.password,
      salt,
      310000,
      32,
      "sha256",
      async function (err, hashedPassword) {
        const user = new User({ ...req.body, password: hashedPassword, salt });
        const response = await user.save();
        req.login(sanitizeUser(response), (err) => {
          if (err) {
            res.status(400).json(err);
          } else {
            const token = jwt.sign(sanitizeUser(user), secret_key);
            res
              .cookie("jwt", token, {
                expires: new Date(Date.now() + 3600000),
                httpOnly: true,
              })
              .status(201)
              .json(token);
          }
        });
      }
    );
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.loginUser = async (req, res) => {
  res.cookie("jwt", req.user.token, {
    expires: new Date(Date.now() + 3600000),
    httpOnly: true,
  })
  .status(201)
  .json(req.user.token);
};

exports.checkAuth = async (req, res) => {
  if(req.user){
  res.json(req.user );
}else{
  res.senStatus(401);
}
};
