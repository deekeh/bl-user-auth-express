const mongoose = require("mongoose");
const User = require("../models/User");

module.exports.registerUser = (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName)
    return res.status(400).json({
      code: "firstname_required",
    });
  else if (!lastName)
    return res.status(400).json({
      code: "lastname_required",
    });
  else if (!email)
    return res.status(400).json({
      code: "email_required",
    });
  else if (!password)
    return res.status(400).json({
      code: "password_required",
    });
  else if (!/^([A-Z][a-zA-Z]{2,})$/.test(firstName))
    return res.status(400).json({
      code: "firstname_invalid_format",
    });
  else if (!/^([A-Z][a-zA-Z]{2,})$/.test(lastName))
    return res.status(400).json({
      code: "lastname_invalid_format",
    });
  else if (
    !/^([a-zA-Z0-9]+([.][a-zA-Z0-9]+)*)[@]([a-zA-Z0-9]+([.][a-zA-Z]{2,})+)$/.test(
      email
    )
  )
    return res.status(400).json({
      code: "email_invalid_format",
    });
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
    })
  else {
    User.findOne({email, password})
    .then(data => {
      if (data) {
        res.status(200).send("success");
      }
      else {
        res.status(200).send("fail");
      }
    })
  }
  // res.send(req.body);
};
