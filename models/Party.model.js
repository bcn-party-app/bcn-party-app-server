const { Schema, model } = require("mongoose");

const partySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
    },
    club: {
        type: Schema.Types.ObjectId,
        ref: "Club",
        required: [true, "Club is required."]
    },
    attendees: [{type: Schema.Types.ObjectId, ref: 'User' }],
    date: {
        type: Date,
        required: [true, "Date is required."]
    },
    musicGenre: {
        type: String,
        enum: ["techno", "house", "pop", "hip-hop", "rock", "reggaeton"],
        required: [true, "Music genre is required."]
    },
    image: {
        type: String
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Party = model("Party", partySchema);

module.exports = Party;
