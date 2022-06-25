const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    firstName: {type: String, required: [true, 'First name is required']},
    surname: {type: String, required: [true, 'Surname is required']},
    birthdate: {type: String, required: [true, 'Birthdate is required']},
    address: {type: String, required: [true, 'Address is required']},
    email: { type: String, required: [true, 'Email address is required'], unique: [true, 'This email address has been used'] },
    password: { type: String, required: [true, 'Password is required'] },
});

userSchema.pre('save', function(next){
  let user = this;
  if (!user.isModified('password'))
      return next();
  bcrypt.hash(user.password, 10)
  .then(hash => {
    user.password = hash;
    next();
  })
  .catch(err => next(error));
});

userSchema.methods.comparePassword = function(inputPassword) {
  let user = this;
  return bcrypt.compare(inputPassword, user.password);
}

//collection name is mobile in the database
module.exports = mongoose.model('User', userSchema);
