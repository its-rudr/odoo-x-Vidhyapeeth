const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  licensePlate: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['Truck', 'Van', 'Bike'], required: true },
  maxCapacity: { type: Number, required: true, min: 0 },
  odometer: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['Available', 'On Trip', 'In Shop', 'Out of Service'], default: 'Available' },
  acquisitionCost: { type: Number, default: 0 },
  region: { type: String, default: 'Default' },
  imageUrl: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
