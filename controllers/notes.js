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
    const note = new Note({ title, description, color, creator: req.user._id });
    note
      .save()
      .then((data) => {
        if (data.creator === req.user._id) return res.status(201).json(data);
      })
      .catch((err) => {
        logger.error(`Server error while creating note - ${err}`);
        res.status(500).json({
          code: "internal_server_error"
        })
      });
  }
};

module.exports.editNote = (req, res) => {
  const { id } = req.params;
  Note.findById(id)
    .then((data) => {
      if (data) {
        if (data.creator === req.user._id) return Note.findByIdAndUpdate(id, { ...req.body });
        return Promise.reject("not_found");
      } else {
        return Promise.reject("not_found");
      }
    })
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((err) => {
      logger.debug(`Note id: ${id} edit error - ${err.message || err}`);
      return res.status(404).json({
        code: err.message || err,
      });
    });
};

module.exports.getNotes = (req, res) => {
  Note.find({creator: req.user._id})
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      logger.error(`Server error while getting notes - ${err}`);
      res.status(500).json(err);
    });
};

module.exports.archiveNote = (req, res) => {
  Note.findById(req.params.id)
    // .then(data => {
    //   if (data && data[0]._id.toString() != req.user._id) return res.status(404).json({
    //     code: "not_found",
    //   })
    //   return data;
    // })
    .then((data) => {
      console.log(data.creator, req.user._id);
      if (data.creator !== req.user._id)
      return Promise.reject("not_found");
      if (data.isArchived) {
        return Promise.reject("already_archived");
      }
    })
    .then(() => {
      return Note.findByIdAndUpdate(req.params.id, { isArchived: true });
    })
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      if (err.message == "already_archived") {
        logger.debug(
          `Note id: ${req.params.id} archive error - ${err.message}`
        );
        return res.status(400).json({
          code: err.message,
        });
      } else {
        logger.debug(`Note id: ${req.params.id} archive error - not_found`);
        res.status(404).json({
          message: `Note id: ${req.params.id} not found`,
        });
      }
    });
};

module.exports.deleteNote = (req, res) => {
  const { id } = req.params;
  const creator = req.user._id;
  Note.findById(id)
    .then((data) => {
      if (data) {
        // if (data.isDeleted === true) return Promise.reject("not_foundx");
        if (data.creator !== creator) return Promise.reject("not_found");
        return Note.findByIdAndUpdate(id, { isDeleted: true });
      } else {
        return Promise.reject("not_found");
      }
    })
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      if (err.message == "not_found") {
        logger.debug(`Note id: ${req.params.id} delete error - ${err.message}`);
        res.status(404).json({
          code: err.message,
        });
      } else {
        logger.debug(`Note id: ${req.params.id} delete error - ${err}`);
        res.status(404).json({
          message: err,
        });
      }
    });
};

module.exports.getArchivedNotes = (req, res) => {
  Note.find({creator: req.user._id, isArchived: true})
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      logger.error(`Server error while getting notes - ${err}`);
      res.status(500).json(err);
    });
};

module.exports.getDeletedNotes = (req, res) => {
  Note.find({creator: req.user._id, isDeleted: true})
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      logger.error(`Server error while getting notes - ${err}`);
      res.status(500).json(err);
    });
};
