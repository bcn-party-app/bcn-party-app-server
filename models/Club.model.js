const { Schema, model } = require("mongoose");

const clubSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."]
    },
    parties: [{ type: Schema.Types.ObjectId, ref: 'Party' }],
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
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Club = model("club", clubSchema);

module.exports = Club;
