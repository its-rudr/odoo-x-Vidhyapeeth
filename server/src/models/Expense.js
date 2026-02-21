const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
  category: { type: String, enum: ['Fuel', 'Maintenance', 'Insurance', 'Toll', 'Other'], required: true },
  amount: { type: Number, required: true, min: 0 },
  liters: { type: Number, default: 0 },
  date: { type: Date, required: true },
  description: { type: String, default: '' },
  receipt: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
