
const Amenity = require("../models/amenity.model");
const slugify = require("slugify");

module.exports = async (str) => {
    let slug = slugify(str,{
        lower: true,
        strict: true,
        locale: "vi",
        trim: true
    });
    let uniqueSlug = slug;
    let count = 1;
    while (await Amenity.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${slug}-${count}`;
        count++;
    }

    return uniqueSlug;
}