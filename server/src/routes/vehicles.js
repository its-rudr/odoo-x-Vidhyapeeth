const express = require('express');
const Vehicle = require('../models/Vehicle');
const { auth, authorize } = require('../middleware/auth');
const { validate, validateVehicle } = require('../middleware/validate');
const router = express.Router();

// Get all vehicles with optional filters (org-shared)
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

// Create vehicle (manager, dispatcher only)
router.post('/', auth, authorize('manager', 'dispatcher', 'safety_officer'), validate(validateVehicle), async (req, res) => {
  try {
    const vehicle = await Vehicle.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update vehicle (owner only, manager/dispatcher/safety_officer)
router.put('/:id', auth, authorize('manager', 'dispatcher', 'safety_officer'), async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found or access denied.' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete vehicle (owner only, manager only)
router.delete('/:id', auth, authorize('manager'), async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found or access denied.' });
    res.json({ message: 'Vehicle deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
