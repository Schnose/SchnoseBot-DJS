const mongoose = require("mongoose");

const sheetSchema = new mongoose.Schema({
	mapList: Object,
	mapName: Object,
	course: Object,
	SKZ: Object,
	KZT: Object,
	VNL: Object,
	tpTier: Number,
	proTier: Number,
	tags: Array,
	jsArea: Boolean,
});

module.exports = mongoose.model("tierSheet", sheetSchema);
