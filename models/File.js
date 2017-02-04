var mongoose = require('mongoose');

var FileSchema = new mongoose.Schema({
	original_name: String,
	new_name: String,
	changed: {type: String, default: "false"}
});

module.exports = mongoose.model('File', FileSchema);
