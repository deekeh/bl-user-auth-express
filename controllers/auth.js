/*
  NOTE: Authentication by saving a token to DB
  has been discontinued & replaced by a newer
  method 'jsonwebtoken' which generates unique
  tokens by using unique user details like _id
  & email and encodes them into the token. The
  generated token is sent back as response.

  Edited by: DK
  Date: 11/09/2021 05:45:00 PM
*/

require("dotenv/config");
const User = require("../models/User");
const AuthToken = require("../models/AuthToken");
const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const SMTPTransport = require("nodemailer/lib/smtp-transport");
const { urlencoded } = require("express");

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
          bcrypt
            .genSalt(10)
            .then((salt) => bcrypt.hash(req.body.password, salt))
            .then((hash) => {
              const user = new User({ ...req.body, password: hash });
              return user;
            })
            .then((user) => {
              user
                .save()
                .then((data) => {
                  return res.json(data);
                })
                .catch((err) => {
                  logger.error(`registration error on server - +${err}`);
                  return res.status(400).send(err);
                });
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
    User.findOne({ email }).then((data) => {
      if (data) {
        bcrypt.compare(req.body.password, data.password).then((result) => {
          if (result) {
            const token = jwt.sign(
              { email: data.email, _id: data._id },
              process.env.ACCESS_SECRET
            );
            req.user = {};
            req.user.id = data._id.toString();
            req.user.email = data.email;
            logger.silly(`logged in user ${req.user.email}/${req.user.id}`);

            res.status(201).json({ token });
          } else {
            res.status(401).json({
              code: "wrong_password",
            });
          }
        });

        // OLD CODE FOR AUTHENTICATION WITHOUT JWT
        // const token = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        // const authToken = new AuthToken({
        //   token,
        // });
        // authToken
        //   .save()
        //   .then((tokenData) => {
        //     res.status(200).send({
        //       token: tokenData.token,
        //     });
        //   })
        //   .catch((err) => console.error(err));
      } else {
        logger.error("login validation error - user not found");
        res.status(404).json({
          code: "user_not_found",
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

// reset password
module.exports.resetPassword = (req, res) => {
  const { email } = req.query;
  console.log(email);
  User.findOne({ email })
    .then((user) => {
      if (user) {
        const resetToken = jwt.sign({ email }, process.env.ACCESS_SECRET);

        // send mail to the user
        const smtpTransport = nodemailer.createTransport({
          service: process.env.MAIL_SERVICE,
          auth: {
            user: process.env.MAIL_ID,
            pass: process.env.MAIL_PASSWORD,
          },
        });
        smtpTransport.sendMail(
          {
            from: `${process.env.MAIL_NAME} <${process.env.MAIL_ID}>`,
            to: email,
            subject: "Test mail",
            html: `
            <div>Hello ${user.firstName},</div>
            <br />
            <div>
              We got a password reset request from you. Please click <a href="http://${req.header(
                "host"
              )}/u/reset/verify/${encodeURI(
              resetToken
            )}">here</a> to reset your password.
            </div>
            <div><i>Paste this link in the browser if the link is un-clickable: http://${req.header(
              "host"
            )}/u/reset/verify/${encodeURI(resetToken)}</i></div>
            `,
          },
          (err, response) => {
            if (err) {
              console.error(err);
              logger.error(err);
              return res.send(500).json({
                code: "internal_server_error",
              });
            } else {
              return res.status(200).json({
                code: "mail_sent",
              });
            }
          }
        );
      } else {
        return res.status(404).json({
          code: "user_not_found",
        });
      }
    })
    .catch((err) => {
      logger.error(`Server error while resetting password - ${err}`);
      return res.status(500).json({
        code: "internal_server_error",
      });
    });
};

// verify password reset link and set new password
module.exports.resetPasswordVerify = (req, res) => {
  const { token: encodedToken } = req.params;
  const token = decodeURI(encodedToken);
  const { password } = req.body;

  if (!encodedToken)
    return res.status(400).json({
      code: "token_not_provided",
    });
  if (!password)
    return res.status(400).json({
      code: "password_not_provided",
    });

  jwt.verify(token, process.env.ACCESS_SECRET, (err, user) => {
    if (err) {
      logger.error(`Server error while resetting password - ${err}`);
      return res.status(500).json({
        code: "internal_server_error",
      });
    }
    User.findOne().then((data) => {
      if (data) {
        bcrypt
          .genSalt(10)
          .then((salt) => bcrypt.hash(password, salt))
          .then((hash) => {
            User.findOneAndUpdate(
              { email: user.email },
              { password: hash }
            ).then(() => {
              return res.json({
                email: user.email,
              });
            });
          })
          .catch((err) => {
            logger.error(
              `internal_server_error while password-reset verification - ${err}`
            );
            return res.status(500).json({
              code: "internal_server_error",
            });
          });
      }
    });
  });
};
