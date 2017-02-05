var mongoose = require('mongoose');

var FileSchema = new mongoose.Schema({
	name: String,
	path: String,
	size: String,
	type: String,
	changed: {type: String, default: "false"}
});

module.exports = mongoose.model('File', FileSchema);
