const Pet = require("../models/Pet");
const User = require("../models/User");
const mongoose = require("mongoose");

const seenAllRequest = async (req, res) => {
  try {
    const { user_id } = req.user;

    await User.updateMany(
      { _id: user_id },
      {
        $set: {
          "Carer.requests.$[].seen": true,
        },
      },
      { multi: true }
    );
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
  }
};

const getUpcomingRequest = async (req, res) => {
  try {
    const currentDay = new Date().setHours(0, 0, 0, 0);
    const request = await User.aggregate([
      { $unwind: "$Carer.requests" },
      {
        $match: {
          "Carer.requests.start": {
            $gte: new Date(currentDay),
          },

          _id: mongoose.Types.ObjectId(req.user.user_id),
        },
      },
      {
        $project: {
          request: "$Carer.requests",
        },
      },
    ]);
    res.send(request);
  } catch (error) {
    console.log(error);
  }
};

const getCarerPendingRequest = async (req, res) => {
  try {
    const request = await User.aggregate([
      { $unwind: "$Carer.requests" },
      {
        $match: {
          "Carer.requests.status": {
            $eq: "Pending",
          },

          _id: mongoose.Types.ObjectId(req.user.user_id),
        },
      },
      {
        $project: {
          request: "$Carer.requests",
        },
      },
    ]);
    res.send(request);
  } catch (error) {
    console.log(error);
  }
};

const modifyRequest = async (req, res) => {
  try {
    const { request_id, user_id, action } = req.body;
    await User.updateOne(
      { "Carer.requests._id": request_id, _id: user_id },
      {
        $set: {
          "Carer.requests.$.status": action,
          "Carer.requests.$.seen": false,
        },
      }
    );
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
  }
};

const getRequestsForPetOwner = async (req, res) => {
  try {
    const { user_id } = req.user;
    const currentDay = new Date().setHours(0, 0, 0, 0);

    const userPets = await Pet.find({ owner_id: user_id }, { _id: 1 });
    const petsIds = userPets.map((id) => id._id.toString());

    const match =
      req.params.status === "Approved"
        ? {
            $match: {
              "Carer.requests.status": req.params.status,
              "Carer.requests.pet_id": { $in: petsIds },
              "Carer.requests.end": {
                $gte: new Date(currentDay),
              },
            },
          }
        : {
            $match: {
              "Carer.requests.status": req.params.status,
              "Carer.requests.pet_id": { $in: petsIds },
            },
          };
    const request = await User.aggregate([
      {
        $unwind: "$Carer.requests",
      },
      {
        ...match,
      },
      {
        $project: {
          _id: "$_id",
          request: "$Carer.requests",
          username: "$username",
          profile_picture: "$profile_picture",
        },
      },
    ]);
    res.send(request);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

const getRequestsByStatusAndPetId = async (req, res) => {
  try {
    const pet_id = req.params.id;
    const status = req.params.status;

    const request = await User.aggregate([
      {
        $unwind: "$Carer.requests",
      },
      {
        $match: {
          "Carer.requests.status": status,
          "Carer.requests.pet_id": pet_id,
        },
      },
      {
        $project: {
          _id: "$_id",
          request: "$Carer.requests",
          username: "$username",
          profile_picture: "$profile_picture",
        },
      },
    ]);
    res.send(request);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

const addRequest = async (req, res) => {
  try {
    const { user_id } = req.user;
    await User.updateOne({ _id: user_id }, { $set: req.body });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  modifyRequest,
  getRequestsForPetOwner,
  getRequestsByStatusAndPetId,
  addRequest,
  getUpcomingRequest,
  getCarerPendingRequest,
  seenAllRequest,
};
