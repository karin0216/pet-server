const Pet = require("../models/Pet");
const Carer = require("../models/Carer");
const User = require("../models/User");

//get all pets
const getAllPets = async (req, res) => {
	try {
		const pets = await Pet.find();
		res.status(200).send(pets);
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
};

// add pet info
const addPet = async (req, res) => {
	try {
		const { name, description, pet_pictures, type, owner_id } = req.body;
		const savedPet = await Pet.create({
			name: name,
			description: description,
			pet_pictures: pet_pictures,
			type: type,
			owner_id: owner_id,
		});
		res.status(200).send(savedPet);
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
};

// get pet info
const getPet = async (req, res) => {
	try {
		const pet = await Pet.findById(req.params.id);
		res.status(200).send(pet);
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
};

// get pet info by ower_id
const getPetByOwnerId = async (req, res) => {
	try {
		const { user_id } = req.user;
		const pet = await Pet.findOne({ owner_id: user_id });
		res.status(200).send(pet);
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
};

// get pets by pet type
const getPetsByType = async (req, res) => {
	try {
		const pets = await Pet.find({ type: req.params.type.toLowerCase() });
		res.status(200).send(pets);
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
};

// update pet info
const updatePet = async (req, res) => {
	try {
		await Pet.findByIdAndUpdate(req.params.id, {
			$set: req.body,
		});
		res.status(200).send("Pet info is successfully updated!");
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
};

// delete pet info
const deletePet = async (req, res) => {
	try {
		await Pet.findByIdAndDelete(req.params.id);
		res.status(200).send("Pet info is successfully deleted!");
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
};

// get all requests for pet
const getRequestsForPet = async (req, res) => {
	try {
		const { user_id } = req.user;
		console.log(user_id);

		const userPets = await Pet.find({ owner_id: user_id }, { _id: 1 });
		const petsIds = userPets.map((id) => id._id.toString());
		const request = await User.aggregate([
			{
				$unwind: "$Carer.requests",
			},
			{
				$match: {
					"Carer.requests.status": "Pending",
					"Carer.requests.pet_id": { $in: petsIds },
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

module.exports = {
	addPet,
	getPet,
	getPetByOwnerId,
	getPetsByType,
	updatePet,
	deletePet,
	getAllPets,
	getRequestsForPet,
};
