const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => console.log('DB connected successfully'));

// READ JSON FILE
// data is retreived as string but JSON.parse() converts it to object
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'),
);

//IMPORT DATA TO DATABASE
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data Successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DATABASE
const deleteAllData = async () => {
  try {
    await Tour.deleteMany();
    ``;
    console.log('Data deleted successfully!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// console.log(process.argv);

// process.arv is an array of command line arguments in case we type
// node dev-data/data/import-dev-data.js --import the array looks like this
// [
//  '/opt/homebrew/Cellar/node/24.7.0/bin/node',
//  '/Users/pranalihabib/Desktop/natours/dev-data/data/import-dev-data.js',
//   '--import'
//] so now we check for the third value in array which is at index 2
// if its --import, we call importData() else if its --delete we call deleteData()
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteAllData();
}

/*
🔹 JSON.stringify() -> Converts object → string
 BEFORE(object) - const obj = {
  name: "Tour A",
  price: 500
};

 AFTER - const str = JSON.stringify(obj);

 RESULT - '{"name":"Tour A","price":500}'

 typeof str // "string"
 */

/*
🔹 JSON.parse() -> Converts string -> object
 BEFORE(object) - const str = '{"name":"Tour A","price":500}';

 AFTER - const obj = JSON.parse(str);

 RESULT - { name: "Tour A", price: 500 }
 
 typeof obj // "object"
 */
