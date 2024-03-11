const mongoose = require("mongoose");
const { DateTime } = require("luxon");


const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  description: { type: String, required: true, maxLength: 100 },
  price: { type: Number },
  stock: { type: Number },
  date: { type: Date, default: Date.now },
  genre: [{ type: Schema.Types.ObjectId, ref: "Genre" }],
  file: { type: Buffer, contentType: String },
});


// Virtual for Item's URL
ItemSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/item/${this._id}`;
});

// Export model


ItemSchema.virtual("date_formatted").get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

ItemSchema.virtual("due_back_yyyy_mm_dd").get(function () {
    return DateTime.fromJSDate(this.date).toISODate(); // format 'YYYY-MM-DD'
  });

module.exports = mongoose.model("Item", ItemSchema);

  