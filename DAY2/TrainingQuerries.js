db.users.aggregate([
  {
    $project: {
      _id: 0,
      fullname: {
        $concat: [
          { $toUpper: { $substrCP: ["$name.first", 0, 1] } },
          {
            $substrCP: [
              "$name.first",
              1,
              {
                $subtract: [{ $strLenCP: "$name.first" }, 1],
              },
            ],
          },
          " ",
          { $toUpper: { $substrCP: ["$name.last", 0, 1] } },
          {
            $substrCP: [
              "$name.last",
              1,
              {
                $subtract: [{ $strLenCP: "$name.last" }, 1],
              },
            ],
          },
        ],
      },
      gender: 1,
      age: "$dob.age",
      location: {
        coordinates: [
          {
            $convert: {
              input: "$location.coordinates.longitude",
              to: "double",
              onNull: 0.0,
              onError: 0.0,
            },
          },
          {
            $convert: {
              input: "$location.coordinates.latitude",
              to: "double",
              onNull: 0.0,
              onError: 0.0,
            },
          },
        ],
      },
    },
  },
  {
    $out: "transformedusers",
  },
]);

// 1.
db.users.explain("executionStats").find({ "dob.age": { $gt: 70 } });
//2.
db.users.createIndex({ "dob.age": 1 });
// 3.
db.users.explain("executionStats").find({ "dob.age": { $gt: 70 } });

//1.
db.users
  .explain("executionStats")
  .find({ "dob.age": { $gt: 60 }, gender: "male" });

//2.
db.users.createIndex({ "dob.age": 1, gender: 1 }, { name: "age_gender" });
// 3.
db.users
  .explain("executionStats")
  .find({ "dob.age": { $gt: 60 }, gender: "male" });

// Text Indexes

db.products.insertMany([
  {
    title: "Laptop",
    description: "Its is a need for an hour. It also must have a camera.",
  },
  {
    title: "Tv",
    description: "Its used for entertainment",
  },
]);

db.products.createIndex({ description: "text" });

db.products.find(
  { $text: { $search: "highresolution camera" } },
  { score: { $meta: "textScore" } },
);

// Geo Spatial Index

db.places.insertOne({
  name: "Wankhede Stadium",
  location: {
    type: "Point",
    coordinates: [72.8262038494082, 18.9390354947439],
  },
});

db.places.insertOne({
  name: "INOX",
  location: {
    type: "Point",
    coordinates: [72.82899334675568, 18.943257019601816],
  },
});

//1.
db.places.createIndex({ location: "2dsphere" });


//2.

db.places.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [72.82384350555984, 18.93593017032731],
      },
      $minDistance: 10, // meters
      $maxDistance: 500,
    },
  },
});


//3.
// Provide polygon (collection) of Points[long,lat]
const point1 = [72.82384350555984, 18.93593017032731]; // marine drive
const point2 = [72.82770588631921, 18.936457876561306]; // GST Bhavan
const point3 = [72.82730891939178, 18.941663812387432]; // Liberty Cinema
const point4 = [72.82403662460638, 18.943774554943527]; // state bank

db.places.find({
  location: {
    $geoWithin: {
      $geometry: {
        type: "Polygon",
        coordinates: [[point1, point2, point3, point4, point1]],
      },
    },
  },
});
