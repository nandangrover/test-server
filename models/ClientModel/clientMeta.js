const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Creates a collection called options in the Quiz database
 */
const ClientMetaSchema = new Schema({
  AgencyId: String,
  Name: String,
  Email: String,
  PhoneNumber: Number,
  TotalBill: Number,
  date: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model('ClientMeta', ClientMetaSchema);