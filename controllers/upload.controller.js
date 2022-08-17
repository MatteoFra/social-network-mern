const UserModel = require("../models/user.model");
const fs = require("fs");
const { uploadErrors } = require("../utils/errors.utils");

module.exports.uploadProfil = async (req, res) => {
  try {
    if (
      req.file.mimetype != "image/jpg" &&
      req.file.mimetype != "image/png" &&
      req.file.mimetype != "image/jpeg"
    )
      throw Error("invalid file");

    if (req.file.size > 500000) throw Error("max size");
  } catch (err) {
    const errors = uploadErrors(err);
    return res.status(201).json({ errors });
  }
  const fileName = req.body.userId + '.' + req.file.mimetype.split('/')[1];

  fs.writeFile(`${__dirname}/../client/public/uploads/profil/${fileName}`, req.file.buffer, function (err) {
    if (err)
      return res.status(201).json(err);
  });

  try {
    await UserModel.findByIdAndUpdate(
      req.body.userId,
      { $set: { picture: "./uploads/profil/" + fileName } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
    .then((docs) => { return res.send(docs) })
    .catch((err) => { return res.status(500).send({ message: err }) })
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
