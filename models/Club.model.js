const { Schema, model } = require("mongoose");

const clubSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."]
    },
    streetName: {
        type: String,
        required: [true, "Street name is required."]

    },
    streetNumber: {
        type: Number,
        required: [true, "Street number is required."]

    },
    image: {
        type: String
    },
    parties: [{ type: Schema.Types.ObjectId, ref: 'Party' }]
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Club = model("Club", clubSchema);

module.exports = Club;
