if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const user = require("./routes/user.js");

// ================= DATABASE =================

const dbUrl = process.env.ATLASDB_URL;

main()
    .then(() => console.log("Connected to DB"))
    .catch((err) => console.log(err));

async function main() {
    await mongoose.connect(dbUrl);
}

// ================= VIEW ENGINE =================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// ================= MIDDLEWARE =================

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ================= SESSION =================

const secret = process.env.SECRET

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("SESSION STORE ERROR:", err);
});

const sessionOptions = {
    store,
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

// ================= PASSPORT =================

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ================= GLOBAL VARIABLES =================

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// ================= ROUTES =================

app.get("/", (req, res) => {
    res.render("listings/root");
});

app.get("/demouser", async (req, res) => {
    let fakeUser = new User({
        email: "student2@gmail.com",
        username: "manohar2",
    });

    let registeredUser = await User.register(fakeUser, "helloworld");

    res.send(registeredUser);
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);
app.use("/", user);

// ================= 404 =================

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went Wrong" } = err;

    res.status(statusCode).render("listings/error", {
        statusCode,
        message,
    });
});

// ================= SERVER =================

app.listen(8000, () => {
    console.log("App is listening on port 8000");
});