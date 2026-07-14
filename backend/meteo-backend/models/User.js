const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favorites: [
    {
      city_name: { type: String, required: true },
      rain_alert: {
        start_time: { type: Date, default: null }, // Optional
        rain_volume: { type: Number, default: null } // Optional
      }
    }
  ]
 });


// Hash password before saving to the database
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare passwords for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);