const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => console.log('DB connected successfully'));

// mongoose
// .connect(process.env.DATABASE_LOCAL)
// .then(() =>
//   console.log('DB connected successfully'),
// );

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('ERROR: ', err);
//   });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port: http://localhost:${port}`);
});
