const sendToken = async (user, statusCode, res) => {
    //create token & save in cookie
    const token = await user.getJWTToken();

    // option for cookie
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        // httpOnly: true,
        sameSite: "None",
        secure: true,
    };
    const secureUser = user.toObject();
    delete secureUser.password;
    JSON.stringify(secureUser);
    res.status(statusCode).cookie("cookieToken", token, options).json({
        success: true,
        user: secureUser,
        token,
    });
};

module.exports = sendToken;
