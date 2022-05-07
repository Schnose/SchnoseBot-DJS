import mongoose from "mongoose";

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

export default mongoose.model("tierSheet", sheetSchema);
