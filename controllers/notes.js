const Note = require("../models/Note");
const logger = require("../utils/logger");

module.exports.saveNote = (req, res) => {
  const { title, description, color } = req.body;
  if (!title) {
    logger.debug("notes validation error - title required");
    return res.status(400).json({
      code: "title_required",
    });
  } else if (!description) {
    logger.debug("notes validation error - description required");
    return res.status(400).json({
      code: "description_required",
    });
  } else if (!color) {
    logger.debug("notes validation error - color required");
    return res.status(400).json({
      code: "color_required",
    });
  } else {
    const note = new Note({ title, description, color });
    note
      .save()
      .then((data) => {
        return res.status(201).json(data);
      })
      .catch((err) => {
        logger.error(`Server error while creating note - ${err}`);
      });
  }
};
