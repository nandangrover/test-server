const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Creates a collection called options in the Quiz database
 */
const AgencyMetaSchema = new Schema({
  Name: String,
  Address1: String,
  Address2: String,
  State: String,
  City: String,
  PhoneNumber: Number,
  date: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model('AgencyMeta', AgencyMetaSchema);