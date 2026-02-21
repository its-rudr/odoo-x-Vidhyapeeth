const express = require('express');
const Driver = require('../models/Driver');
const { auth, authorize } = require('../middleware/auth');
const { validate, validateDriver } = require('../middleware/validate');
const router = express.Router();

// Get all drivers (org-shared)
router.get('/', auth, async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { licenseNumber: { $regex: search, $options: 'i' } },
    ];
    const drivers = await Driver.find(filter).sort({ createdAt: -1 });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single driver
router.get('/:id', auth, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found.' });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create driver (manager, safety_officer only)
router.post('/', auth, authorize('manager', 'safety_officer'), validate(validateDriver), async (req, res) => {
  try {
    const driver = await Driver.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update driver (owner only, manager/safety_officer)
router.put('/:id', auth, authorize('manager', 'safety_officer'), async (req, res) => {
  try {
    const driver = await Driver.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!driver) return res.status(404).json({ message: 'Driver not found or access denied.' });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete driver (owner only, manager only)
router.delete('/:id', auth, authorize('manager'), async (req, res) => {
  try {
    const driver = await Driver.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!driver) return res.status(404).json({ message: 'Driver not found or access denied.' });
    res.json({ message: 'Driver deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
