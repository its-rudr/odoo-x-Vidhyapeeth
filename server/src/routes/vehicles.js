const express = require('express');
const Vehicle = require('../models/Vehicle');
const { auth } = require('../middleware/auth');
const { validate, validateVehicle } = require('../middleware/validate');
const router = express.Router();

// Get all vehicles with optional filters
router.get('/', auth, async (req, res) => {
  try {
    const { type, status, region, search } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (region) filter.region = region;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { licensePlate: { $regex: search, $options: 'i' } },
    ];
    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single vehicle
router.get('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create vehicle
router.post('/', auth, validate(validateVehicle), async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update vehicle
router.put('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete vehicle
router.delete('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
    res.json({ message: 'Vehicle deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
