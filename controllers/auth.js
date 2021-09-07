const mongoose = require("mongoose");
const User = require("../models/User");
const AuthToken = require("../models/AuthToken");
const logger = require("../utils/logger");

module.exports.registerUser = (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName) {
    logger.debug("validation error - firstname required");
    return res.status(400).json({
      code: "firstname_required",
    });
  } else if (!lastName) {
    logger.debug("validation error - lastname required");
    return res.status(400).json({
      code: "lastname_required",
    });
  } else if (!email) {
    logger.debug("validation error - email required");
    return res.status(400).json({
      code: "email_required",
    });
  } else if (!password) {
    logger.debug("validation error - password required");
    return res.status(400).json({
      code: "password_required",
    });
  } else if (!/^([A-Z][a-zA-Z]{2,})$/.test(firstName)) {
    logger.debug("validation error - firstname format invalid");
    return res.status(400).json({
      code: "firstname_invalid_format",
    });
  } else if (!/^([A-Z][a-zA-Z]{2,})$/.test(lastName)) {
    logger.debug("validation error - lastname format invalid");
    return res.status(400).json({
      code: "lastname_invalid_format",
    });
  } else if (
    !/^([a-zA-Z0-9]+([.][a-zA-Z0-9]+)*)[@]([a-zA-Z0-9]+([.][a-zA-Z]{2,})+)$/.test(
      email
    )
  ) {
    logger.debug("validation error - email format invalid");
    return res.status(400).json({
      code: "email_invalid_format",
    });
  }
  // else if (!/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})$/.test(password)) return res.status(400).json({
  //   code: "weak_password",
  // })
  else {
    User.findOne({ email })
      .then((data) => {
        if (data)
          res.status(400).json({
            code: "user_already_registered",
          });
        else {
          const user = new User(req.body);
          user
            .save()
            .then((data) => {
              return res.json(data);
            })
            .catch((err) => {
              logger.error(`registration error on server - +${err}`);
              return res.status(400).send(err);
            });
        }
      })
      .catch((err) => console.error(err));
  }
};

module.exports.loginUser = (req, res) => {
  const { email, password } = req.body;
  if (!email)
    return res.status(400).json({
      code: "email_required",
    });
  else if (!password)
    return res.status(400).json({
      code: "password_required",
    });
  else {
    User.findOne({ email, password }).then((data) => {
      if (data) {
        const token = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        const authToken = new AuthToken({
          email: data.email,
          token: `${token}`,
        });
        authToken
          .save()
          .then((tokenData) => {
            res.status(200).send({
              token: tokenData.token,
            });
          })
          .catch((err) => console.error(err));
      } else {
        logger.error("login validation error - invalid user");
        res.status(404).json({
          code: "invalid_user",
        });
      }
    });
  }
};

module.exports.logoutUser = (req, res) => {
  const { email, token } = req.body;
  AuthToken.findOne({ email, token })
    .then((data) => {
      if (data) {
        AuthToken.deleteOne({ email, token })
          .then(() => {
            res.status(200).json({
              code: "deleted",
            });
          })
          .catch((err) => {
            console.error(err);
            res.status(400).json(err);
          });
      } else {
        logger.error("logout error - no session found");
        res.status(404).json({
          code: "no_session_found",
        });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(400).json(err);
    });
};
