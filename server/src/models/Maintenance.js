const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  type: { type: String, enum: ['Preventive', 'Reactive', 'Inspection'], required: true },
  description: { type: String, required: true },
  cost: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['Scheduled', 'In Progress', 'Completed'], default: 'Scheduled' },
  scheduledDate: { type: Date, required: true },
  completedDate: { type: Date },
  mechanic: { type: String, default: '' },
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
