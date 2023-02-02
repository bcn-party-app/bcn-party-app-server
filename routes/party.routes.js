const router = require("express").Router();
const mongoose = require('mongoose');
const Party = require("../models/Party.model")
const User = require("../models/User.model")
const Club = require("../models/Club.model");
const { update } = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const fileUploader = require("../config/cloudinary.config");


// POST "/api/upload" => Route that receives the image, sends it to Cloudinary via the fileUploader and returns the image URL
router.post("/upload", fileUploader.single("image"), (req, res, next) => {
    // console.log("file is: ", req.file)
   
    if (!req.file) {
      next(new Error("No file uploaded!"));
      return;
    }
    
    // Get the URL of the uploaded file and send it as a response.
    // 'fileUrl' can be any name, just make sure you remember to use the same when accessing it on the frontend
    
    res.json({ fileUrl: req.file.path });
  });

//POST /api/party - creates a new party - WORKING 🟢 

//this needs to be protected w isAuthenticated mw
router.post("/party",isAuthenticated, async (req, res, next) => { 
    const {name, club, date, musicGenre, image} = req.body;
    console.log("req.body.club ===> ", req.body.club)
    const clubId = req.body.club
    //how do I access the owner here?
    console.log("req.payload._id ===>", req.payload._id)
    const owner = req.payload._id

    const newParty = await Party.create({name, club: clubId, date, musicGenre, image, owner, attendees: []})
    Club.findByIdAndUpdate(clubId, { $push: { parties:newParty._id } })
    .then(() => res.json(newParty))
    .catch(err => res.json(err));
})

//GET /api/party - returns all the parties - WORKING 🟢
router.get("/party", isAuthenticated, (req, res, next) => {
    Party.find()
    .populate("club owner")
    .then(allParties => res.json(allParties) )
    .catch(err => res.json(err));
});

//GET /api/party/:partyId - retrieve a party by id
router.get("/party/:partyId", isAuthenticated, (req, res, next) => {
    const {partyId} = req.params;

    Party.findById(partyId)
    .populate("attendees")
    .populate("club")
    .then(foundParty => res.json(foundParty))

    .catch(err => res.json(err));
});

//=====================================================================
//PUT /api/party/:partyId - update a party by Id - WORKING 🟢
router.put("/party/:partyId", async (req, res, next) => {
    const {partyId} = req.params;
    const {name, club, date, musicGenre, image} = req.body;

    if (!mongoose.Types.ObjectId.isValid(partyId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }

//we have 2 cases - user might want to edit the club OR not (together with the other party details)
    //case 1 - user wants to edit the party details, but NOT the club where the party takes place - WORKING 🟢
    if (!req.body.club) {
        const partyToUpdate = await Party.findByIdAndUpdate(partyId, {name, musicGenre, date, image }, {new:true})
        res.json(partyToUpdate)
        // Party.findByIdAndUpdate(partyId, {name, musicGenre, date, image }, {new:true})
        // .then((updatedParty) => res.json(updatedParty))
    //case 2 - user wants to edit the party details, including the club for that party - ALSO  WORKING 🟢
    //so we need to pull the Party from the parties array in the "old" Club
    //and push the Part in the parties array of the "new" Club (req.body.club)
    } else {
        const foundParty = await Party.findById(partyId) 
        console.log("foundParty ==> ", foundParty);
        console.log("req.body.club AKA new club id ==> ", req.body.club)
        console.log("old club for the party / foundParty.club ===> ", foundParty.club)
        Club.findById(foundParty.club)
        .then(oldClub => {
            console.log("oldClub ===>", oldClub);
            const partyIndex = oldClub.parties.indexOf(foundParty);
            oldClub.parties.splice(partyIndex, 1);
            console.log("current parties at oldClub ===> ", oldClub.parties)
            oldClub.save()

            Club.findById(req.body.club)
            .then(newClub => {
                console.log("newClub ==> ", newClub)
                newClub.parties.push(foundParty);
                console.log("current parties at newClub ===> ", newClub.parties)
                newClub.save()
            })
        .then(() => {
                return Party.findByIdAndUpdate(partyId, {name, club, musicGenre, date, image }, {new:true})
                .then((updatedParty) => {
                    console.log(updatedParty);
                    res.json(updatedParty)
                })
            })
        })
        .catch(err => res.json(err));

    }
})    

//1. find the party by id (without updating the party)
//get the id of current club
// remove the party from current Club parties array
//update the Party with findbyIdAndUpdate 



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


//====================================================================================
//PUT api/party/:partyId/attend-party - user says they will attend a specific party - WORKING 🟢
//user shouldn't be in the attendees list already - but we render this conditionally in the frontend (I think?)
router.put("/party/:partyId/attend-party", isAuthenticated, async (req, res, next) => {
    const {partyId} = req.params;
    console.log("req.payload._id", req.payload._id);
    const userId = req.payload._id
    console.log("current user Id ===> ", userId)

//TO DO:
//find that specific party
//push that userId inside that specific Party attendees array, then
//grab the current user (req.payload._id)
//push that partyId inside the current User parties array

    const foundParty = await Party.findById(partyId)
    foundParty.attendees.push(userId)
    foundParty.save()

    const currentUser = await User.findById(userId)
    currentUser.parties.push(partyId)
    currentUser.save()

    res.json({foundParty, currentUser})
})

//=================================================================================
//PUT api/party/:partyId/leave-party - user says they will not attend a specific party - WORKING 🟢
//need to render this conditionally in the frontend, if they previously said they were attending.
//showing a button that toggles between "attend" and "leave"

router.put("/party/:partyId/leave-party", isAuthenticated, async (req, res, next) => {
    const {partyId} = req.params;
    const userId = req.payload._id;
    console.log("current user Id ===> ", userId);

//TO DO:
//1) find that specific party the user doesnt want to attend anymore
//remove the current user from that Party's attendees array
/* 
in the foundParty.attendees array, we need to splice the array where our currentUserId is

*/
//2) grab the current user 
//remove that partyId from the arrays of parties in the User document

    const foundParty = await Party.findById(partyId)
    const attendeeIndex = foundParty.attendees.indexOf(userId);
    foundParty.attendees.splice(attendeeIndex, 1)
    foundParty.save()

    const currentUser = await User.findById(userId)
    const partyIndex = currentUser.parties.indexOf(partyId);
    currentUser.parties.splice(partyIndex, 1)
    currentUser.save()

    res.json({foundParty, currentUser})

});


//===================================================================
//DELETE /api/party/:partyId - deletes a specific party by id
//TO DO: 
//WE NEED TO REMOVE THAT PARTY FROM THAT CLUB'S party ARRAY 
    //grab id of that club
//we need to remove that party from the user's Parties array?
    //find the user id
router.delete("/party/:partyId", async (req, res, next) => {
    const {partyId} = req.params; 
    //const partyId = req.params.partyId

    if (!mongoose.Types.ObjectId.isValid(partyId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }
//remove party from its Club's array of Parties - THIS BLOCK WORKS 🟢
    let partyToRemove = await Party.findById(partyId);
    console.log("PARTY TO REMOVE ID ", partyId)
    const currentClub = await Club.findById(partyToRemove.club) //is this the right way of grabbing the club id?
    console.log("CURRENT CLUB ", currentClub)
    const partyIndexClub = currentClub.parties.indexOf(partyId)
    currentClub.parties.splice(partyIndexClub,1)
    console.log("PARTIES IN THE CLUB NOW: ", currentClub.parties)
    currentClub.save();

//remove party from the Parties array in every User that was attending it: 
    //we can look at the attendees array in that party (who are Users)
    //then remove the partyId from their [parties] array
    const attendees = partyToRemove.attendees
    console.log("ATTENDEES ARR ", attendees)
    
    // ?? How can I use async/await here?? 🟠
    attendees.forEach(attendee => {
        //find index of that Party in the Party array for every existing User
        //splice it from their Party array
        //save user
        User.findById(attendee._id)
        .then((foundUser) => {
            console.log("SINGLE ATTENDEE OF THE PARTY TO BE REMOVED: ", foundUser)
            const partyIndex = foundUser.parties.indexOf(partyId)
            foundUser.parties.splice(partyIndex,1)
            console.log("ARRAY OF PARTIES THE USER IS CURRENTLY GOING TO: ", foundUser.parties)
            foundUser.save();
        })
        .catch(err => console.log(err));
    });

//remove specific Party - WORKS 🟢
    partyToRemove = await Party.findByIdAndRemove(partyId);
    res.json({message: `Party with partyId ${partyId} has been removed.`})

});

module.exports = router;
