const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  licenseCategory: { type: [String], enum: ['Truck', 'Van', 'Bike'], required: true },
  licenseExpiry: { type: Date, required: true },
  status: { type: String, enum: ['On Duty', 'Off Duty', 'On Trip', 'Suspended'], default: 'Off Duty' },
  safetyScore: { type: Number, default: 100, min: 0, max: 100 },
  tripsCompleted: { type: Number, default: 0 },
  tripsCancelled: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

driverSchema.virtual('isLicenseValid').get(function () {
  return this.licenseExpiry > new Date();
});

driverSchema.set('toJSON', { virtuals: true });
driverSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Driver', driverSchema);
