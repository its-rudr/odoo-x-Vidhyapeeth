const express = require('express');
const Expense = require('../models/Expense');
const { auth, authorize } = require('../middleware/auth');
const { validate, validateExpense } = require('../middleware/validate');
const router = express.Router();

// Get all expenses (org-shared)
router.get('/', auth, async (req, res) => {
  try {
    const { category, vehicleId } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (vehicleId) filter.vehicle = vehicleId;
    const expenses = await Expense.find(filter)
      .populate('vehicle', 'name licensePlate type')
      .populate('trip', 'origin destination')
      .sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create expense (manager, analyst only)
router.post('/', auth, authorize('manager', 'analyst'), validate(validateExpense), async (req, res) => {
  try {
    const expense = await Expense.create({ ...req.body, createdBy: req.user._id });
    const populated = await Expense.findById(expense._id)
      .populate('vehicle', 'name licensePlate type')
      .populate('trip', 'origin destination');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update expense (owner only, manager/analyst)
router.put('/:id', auth, authorize('manager', 'analyst'), async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('vehicle', 'name licensePlate type')
     .populate('trip', 'origin destination');
    if (!expense) return res.status(404).json({ message: 'Expense not found.' });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete expense (owner only, manager only)
router.delete('/:id', auth, authorize('manager'), async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found.' });
    res.json({ message: 'Expense deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
