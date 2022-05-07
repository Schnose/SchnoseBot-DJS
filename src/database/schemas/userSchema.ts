import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	userId: String,
	steamId: String,
	mode: String,
	List: Object,
});

export default mongoose.model("users", userSchema);
