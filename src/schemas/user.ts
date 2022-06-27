import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
	name: String,
	discordID: String,
	steamID: String,
	mode: String,
});

export default mongoose.model("user", userSchema);
