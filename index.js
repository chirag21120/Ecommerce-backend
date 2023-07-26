const express = require("express");
const server = express();
const crypto = require("crypto");
const session = require("express-session");
const passport = require("passport");
// const SQLiteStore = require('connect-sqlite3')(session);
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const cookieParser = require('cookie-parser')
const jwt = require("jsonwebtoken");
const connectToMongo = require("./db");
const ProductsRouter = require("./routes/Product");
const categoryRouter = require("./routes/Category");
const brandsRouter = require("./routes/Brands");
const userRouter = require("./routes/User");
const authRouter = require("./routes/Auth");
const cartRouter = require("./routes/Cart");
const orderReducer = require("./routes/Order");
const cors = require("cors");
const { User } = require("./model/User");
const { isAuth, sanitizeUser, cookieExtractor } = require("./services/common");
const dotenv = require("dotenv");

dotenv.config();
connectToMongo();

const port = process.env.PORT || 8080;
const secret_key = process.env.JWT_SECRET;


opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = secret_key;

//Middlewares
server.use(express.static('build'))
server.use(cookieParser())
server.use(
  session({
    secret: "keyboard cat",
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    // store: new SQLiteStore({ db: "sessions.db", dir: "./var/db" }),
  })
);
server.use(passport.authenticate("session"));
server.use(
  cors({
    exposedHeaders: ["X-Total-Count"],
  })
);
server.use(express.json()); //to parse req.body
server.use("/products", isAuth(), ProductsRouter.router);
server.use("/category", isAuth(), categoryRouter.router);
server.use("/brands", isAuth(), brandsRouter.router);
server.use("/users",isAuth(), userRouter.router);
server.use("/auth", authRouter.router);
server.use("/cart", isAuth(), cartRouter.router);
server.use("/orders", isAuth(), orderReducer.router);

//Passport Strategies
passport.use(
  "local",
  new LocalStrategy({usernameField:'email'},async function (email, password, done) {
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        done(null, false, { message: "invalid credentials" });
      } else
        crypto.pbkdf2(
          password,
          user.salt,
          310000,
          32,
          "sha256",
          async function (err, hashedPassword) {
            if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
              done(null, false, { message: "invalid credentials" });
            } else {
              const token = jwt.sign(sanitizeUser(user), secret_key);

              done(null, {token});
            }
          }
        );
    } catch (err) {
      done(err);
    }
  })
);

passport.use(
  "jwt",
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      const user = await User.findById(jwt_payload.id );
      if (user) {
        return done(null, sanitizeUser(user)); //this calls serializer
      } else {
        return done(null, false);
      }
    } catch (error) {
      if (err) {
        return done(err, false);
      }
    }
  })
);

// this create session variable req.user on bbeing called
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, { id: user.id, role: user.role });
  });
});
// this changes session variable req.user on bbeing called from authorized request
passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, {id:user.id,role:user.role});
  });
});

server.listen(port, () => {
  console.log(`listnening at http://localhost:${port}`);
});
