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
db.users.explain("executionStats").find({ "dob.age": { $gt: 60 },"gender":"male" });
