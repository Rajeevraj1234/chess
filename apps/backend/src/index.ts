import express from "express";
import authRouter from "./route/auth";
import v1Router from "./route/v1";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import { initPassport } from "./passport";
import passport from "passport";
import initRedis from "./redis_worker/index"


dotenv.config();
const app = express();

//session middleware
app.use(
  session({
    secret: process.env.COOKIE_SECRET || "keyboard cat",
    resave: false, //not re save the session if it was no modified
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
  })
);

//redis worker    
initRedis();

//passpost middleware
initPassport();
app.use(passport.initialize());
app.use(passport.authenticate("session"));

//alowed host site for the CORS policy
const allowedHosts = process.env.ALLOWED_HOSTS
  ? process.env.ALLOWED_HOSTS.split(",")
  : [];

app.use(
  cors({
    origin: allowedHosts,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.get("/", async (req, res) => {
  res.json({
    message: "welcome to this chess backend",
  });
});

//route for the auth
app.use("/auth", authRouter);
app.use("/v1", v1Router);

app.listen(3000, () => {
  console.log("backend started at port 3000");
});
