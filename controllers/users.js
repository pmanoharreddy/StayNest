const User = require("../models/user.js");

// Render Signup Form
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup");
};

// Signup
module.exports.signup = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;

        const newUser = new User({
            email,
            username,
        });

        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }

            req.flash(
                "success",
                `Welcome to StayNest ${registeredUser.username}`
            );

            res.redirect("/listings");
        });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
};

// Render Login Form
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
};

// Login
module.exports.login = (req, res) => {
    const redirectUrl = res.locals.redirectUrl || "/listings";

    delete req.session.redirectUrl;

    req.flash("success", "Welcome Back!");

    res.redirect(redirectUrl);
};

// Logout
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.flash("success", "You are logged out!");

        res.redirect("/listings");
    });
};