const express = require('express');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const router = express.Router();

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const validateSignup = [
    check('email')
      .exists({ checkFalsy: true })
      .isEmail()
      .withMessage('Please provide a valid email.'),
    check('username')
      .exists({ checkFalsy: true })
      .isLength({ min: 4 })
      .withMessage('Please provide a username with at least 4 characters.'),
    check('username')
      .not()
      .isEmail()
      .withMessage('Username cannot be an email.'),
    check('password')
      .exists({ checkFalsy: true })
      .isLength({ min: 6 })
      .withMessage('Password must be 6 characters or more.'),
    check("firstName", "First Name is required")
        .exists({ checkFalsy: true }),
    check("lastName", "Last Name is required")
        .exists({ checkFalsy: true }),
    handleValidationErrors
  ];

router.post(
    '/',
    validateSignup,
    async (req, res) => {
      const { email, password, username, firstName, lastName } = req.body;
      let errorResult = {
        errors: {}
      };

      const usernameExists = await User.findOne({
        where: {
          username: username
        }
      })
      const emailExists = await User.findOne({
        where: {
          email: email
        }
      })

      if(usernameExists||emailExists){
        errorResult.message = "User already exists";
        errorResult.statusCode = 403;
        if(usernameExists) errorResult.errors.username = "User with that username already exists";
        if(emailExists) errorResult.errors.email = "User with that email already exists";
        res.status(403);
        return res.json(errorResult);
      };

      // if(!firstName || !lastName || !email || !username || !password){
      //   errorResult.message = "Validation error";
      //   errorResult.statusCode = 400;
      //   if(!firstName) errorResult.errors.firstName = "First Name is required";
      //   if(!lastName) errorResult.errors.lastName = "Last Name is required";
      //   if(!email) errorResult.errors.email = "Invalid email";
      //   if(!username) errorResult.errors.username = "Username is required";
      //   res.status(400);
      //   return res.json(errorResult);
      // };

      const user = await User.signup({ email, username, password, firstName, lastName });

      const token = await setTokenCookie(res, user);
      const userJSON = user.toJSON();
      userJSON.token = token;
      return res.json(userJSON);
    }
);




module.exports = router;
