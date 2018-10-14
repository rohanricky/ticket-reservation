var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ticketSchema = new Schema({
  name: {type:String, required : true},
  aisleSeats: {type:Schema.Types.Mixed, required : true},
  available : {type:Schema.Types.Mixed, required : true},
  location: String,
  meta: {
    website: String,
  },
  createdAt: {type:Date, required:true},
  updatedAt: {type:Date, required:true}
});

var ticket = mongoose.model('ticket', ticketSchema);

module.exports = ticket;
