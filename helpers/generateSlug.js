
const slugify = require("slugify");

module.exports = async (str,model) => {
    let slug = slugify(str,{
        lower: true,
        strict: true,
        locale: "vi",
        trim: true
    });
    let uniqueSlug = slug;
    let count = 1;
    while (await model.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${slug}-${count}`;
        count++;
    }

    return uniqueSlug;
}