const router = require("express").Router();
const mongoose = require('mongoose');
const Party = require("../models/Party.model")
const User = require("../models/User.model")
const Club = require("../models/Club.model")

//POST /api/party - creates a new party
router.post("/party", (req, res, next) => {
    const {name, clubId, date, musicGenre, image} = req.body;

    Party.create({name, club: clubId, date, musicGenre, image, attendees: []})
    .then(newParty => {
        return Club.findByIdAndUpdate(clubId, { $push: { parties:newParty._id } });
    })
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
router.put("/party/:partyId", (req, res, next) => {
    const {partyId} = req.params;
    const {name, club, musicGenre, image} = req.body;



    if (!mongoose.Types.ObjectId.isValid(partyId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }
    Party.findById(partyId)
    .then(foundParty => {
        //remove the party from the current club (remove from parties array)
        return Club.findByIdAndUpdate(foundParty.club, { $pull: {parties:foundParty._id }})
        .then()
    })

    //in the Club model
        //remove the party from the parties array of the old club
        //take the clubId of the new club (this will come from req.body)
        //push the party into the parties array of the new club

    //get the clubId of the current club the party is at (this we already have, because it's in the Party)
    
    //in the Party model
    //update the club name and all the other details (req.body) - DONE

    Party.findByIdAndUpdate(partyId, {name, club: clubId, musicGenre, image}, {new:true})
    .then(updatedParty => res.json(updatedParty))
    .catch(err => res.json(err));
});

//DELETE /api/party/:partyId - 

module.exports = router;
