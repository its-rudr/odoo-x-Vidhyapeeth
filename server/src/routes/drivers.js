const express = require('express');
const Driver = require('../models/Driver');
const { auth } = require('../middleware/auth');
const { validate, validateDriver } = require('../middleware/validate');
const router = express.Router();

// Get all drivers
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

// Create driver
router.post('/', auth, validate(validateDriver), async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update driver
router.put('/:id', auth, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!driver) return res.status(404).json({ message: 'Driver not found.' });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete driver
router.delete('/:id', auth, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found.' });
    res.json({ message: 'Driver deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
