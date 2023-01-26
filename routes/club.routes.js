const router = require("express").Router();
const mongoose = require('mongoose');
const Party = require("../models/Party.model")
const User = require("../models/User.model")
const Club = require("../models/Club.model")

//POST /api/club - creates a new club
router.post("/club", (req, res, next) => {
    const {name, streetName, streetNumber, image} = req.body;

    Club.create({name, streetName, streetNumber, parties:[], image})
    .then(response => res.json(response))
    .catch(err => res.json(err));
})

//GET /api/club - returns all the clubs
router.get("/club", (req, res, next) => {
    Club.find()
    .populate("parties")
    .then(allClubs => res.json(allClubs))
    .catch(err => res.json(err))
});

//PUT /api/club/:clubId - update a club by id
router.put("/club/:clubId", (req, res, next) => {
    const {clubId} = req.params;
    const {name, streetName, streetNumber} = req.body;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }

    Club.findByIdAndUpdate(clubId, {name, streetName, streetNumber, image}, {new:true})
    .then(updatedClub => res.json(updatedClub))
    .catch(err => res.json(err));
});


//DELETE /api/club/:clubId - delete a club by id
router.delete("/club/:clubId", (req, res, next) => {
    const {clubId} = req.params;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }

    Club.findByIdAndRemove(clubId)
    .then(() => res.json({message: `Club with clubId ${clubId} is removed successfully.`}))
    .catch(err => res.json(err));
});


module.exports = router;
