const mongoose = require("mongoose");
const { generateSlug } = require('../../util/js/generateSlug');

const BoardSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
});

BoardSchema.pre('save', function(next) {
    if (!this.slug) {
        this.slug = generateSlug(this.name);
    }
    next();
});

const Board = mongoose.model("board", BoardSchema);

module.exports = Board;