const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  origin: { type: String, required: true, trim: true },
  destination: { type: String, required: true, trim: true },
  cargoDescription: { type: String, default: '' },
  cargoWeight: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'], default: 'Draft' },
  startOdometer: { type: Number, default: 0 },
  endOdometer: { type: Number, default: 0 },
  scheduledDate: { type: Date, required: true },
  completedDate: { type: Date },
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
