const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// name, email, photo, password, passwordConfirm

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
    trim: true,
    // minLength: [4, 'A name must have at least 4 characters'],
    // maxLength: [15, 'A name must have at most 15 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required.'],
    unique: [true, 'This email already exists.'],
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email.'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Password is required.'],
    minLength: [8, 'A password must be at least 8 characters long'],
    select: false, // hides password from queries so find() wont return passwords
    // match: [
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
    //   'Password must contain uppercase, lowercase and number',
    // ],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password.'],
    validate: {
      // this only works on create or save
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not same.',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
