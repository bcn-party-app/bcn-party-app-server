const router = require("express").Router();
const mongoose = require('mongoose');
const Party = require("../models/Party.model")
const User = require("../models/User.model")
const Club = require("../models/Club.model")

//POST /api/party - creates a new party
router.post("/party", async (req, res, next) => {
    const {name, clubId, date, musicGenre, image} = req.body;

    const newParty = await Party.create({name, club: clubId, date, musicGenre, image, attendees: []})
    Club.findByIdAndUpdate(clubId, { $push: { parties:newParty._id } })
    .then(() => res.json(newParty))
    .catch(err => res.json(err));
})

//GET /api/party - returns all the parties
router.get("/party", (req, res, next) => {
    Party.find()
    .populate("attendees")
    .then(allParties => res.json(allParties))
    .catch(err => res.json(err))
});

//PUT /api/party/:partyId - update a party by Id
router.put("/party/:partyId", async (req, res, next) => {
    const {partyId} = req.params;
    const {name, club, date, musicGenre, image} = req.body;

    if (!mongoose.Types.ObjectId.isValid(partyId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }

//1. find the party by id (without updating the party)
//get the id of current club
// remove the party from current Club parties array
//update the Party with findbyIdAndUpdate 

    const foundParty = await Party.findById(partyId) 
    console.log("foundParty ==> ", foundParty);
    Club.findById(foundParty.club, {$pull: {parties:foundParty._id }})
    .then(() => {
            return Party.findByIdAndUpdate(partyId, {name, club, musicGenre, image}, {new:true})
            .then((updatedParty) => res.json(updatedParty))
        })

    .catch(err => res.json(err));

    // Party.findByIdAndUpdate(partyId, {name, club, musicGenre, image}, {new:true})
    // .then(updatedParty => {
    //     Club.find({foundParty.club}, { $pull: {parties:foundParty._id }})
    // }

    // .catch(err => res.json(err));

    // Party.findById(partyId)
    // .then(foundParty => {
    //     //remove the party from the current club (remove from parties array)
    //     return Club.findByIdAndUpdate(foundParty.club, { $pull: {parties:foundParty._id }})
    // })
    // .catch(err => res.json(err));

    // Party.findById(partyId)
    // .then(foundParty => {
    //     return Club.findByIdAndUpdate(club, {$push: {parties:foundParty._id}})
    // });

});

//DELETE /api/party/:partyId - deletes a specific party by id
router.delete("/party/:partyId", (req, res, next) => {
    const {partyId} = req.params;

    if (!mongoose.Types.ObjectId.isValid(partyId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }

    Party.findByIdAndRemove(partyId)
    .then(() => res.json({message: `Party with partyId ${partyId} has been removed.`}))
    .catch(err => res.json(err));
});

module.exports = router;
