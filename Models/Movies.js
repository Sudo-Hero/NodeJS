const mongoose = require("mongoose")
const fs = require("fs");
const { timeStamp } = require("console");

const movieSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name field is required!'],
        minLength: [4, `Movie name must be atleast 1 character`],
        maxLength: [100, "Nam must be atmost 100 characters"],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'Duration field is required!'],
    },
    ratings: {
        type: Number,
        min: [1, "Ratings must be 1.0 or above"],
        max: [10, "Ratings must be 10.0 or below"],
        default: 1.0
    },
    totalRating: {
        type: Number,
    },
    releaseYear: {
        type: Number,
        required: [true, 'Release year is required']
    },
    releasDate: {
        type: Date,
        required: [true, 'Release date is required']
    },
    createAt: {
        type: Date,
        default: Date.now()
    },
    createdBy: String,
    generes: {
        type: [String],
        required: [true, 'Genres are required'],
        enum: {
            values: ["Action"],
            message: "Invalid generes provided."
        },
    },
    directors: {
        type: [String],
        required: [true, 'Directors are required']
    },
    coverImage: {
        type: String,
        required: [true, 'Cover Image is required']
    },
    actors: {
        type: [String],
        required: [true, 'Actors are required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required']
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
movieSchema.virtual('durationInHours').get(function () {
    return this.duration / 60;
})
movieSchema.pre('save', function (next) {
    this.createdBy = "admin";
    return next();
})

movieSchema.post('save', function (doc, next) {
    let content = `${doc.name} has been created by ${doc.createdBy} at ${new Date().toDateString()}\n`;
    fs.writeFileSync("./Log/log.txt", content, { flag: 'a' }, (err) => {
        console.log(err);
    });
    this.createdBy = "admin";
    return next();
})

movieSchema.pre(/^find/, async function (next) {
    this.find({ "releasDate": { $lte: Date.now() } });
    this.startTime = Date.now();
    return next();
})

movieSchema.post(/^find/, function (doc, next) {
    this.find({ "releasDate": { $lte: Date.now() } });
    this.endTime = Date.now();
    let content = `Query took ${this.endTime - this.startTime} ms\n`;
    fs.writeFileSync("./Log/log.txt", content, { flag: 'a' }, (err) => {
        console.log("Cannot write log: " + err.message);
    })
    return next();
})

movieSchema.pre("aggregate", function (next) {
    console.log(this.pipeline().unshift({ $match: { releasDate: { $lte: new Date() } } }));
    return next();
})
const Movie = mongoose.model('Movie', movieSchema);


module.exports = Movie;