const express = require('express');
const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');
const { auth } = require('../middleware/auth');
const { validate, validateMaintenance } = require('../middleware/validate');
const router = express.Router();

// Get all maintenance logs
router.get('/', auth, async (req, res) => {
  try {
    const { status, vehicleId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (vehicleId) filter.vehicle = vehicleId;
    const logs = await Maintenance.find(filter)
      .populate('vehicle', 'name licensePlate type')
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create maintenance log - auto sets vehicle to "In Shop"
router.post('/', auth, validate(validateMaintenance), async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.body.vehicle);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });

    // Auto-set vehicle to "In Shop"
    await Vehicle.findByIdAndUpdate(req.body.vehicle, { status: 'In Shop' });

    const log = await Maintenance.create(req.body);
    const populated = await Maintenance.findById(log._id)
      .populate('vehicle', 'name licensePlate type');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update maintenance log
router.put('/:id', auth, async (req, res) => {
  try {
    const log = await Maintenance.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Maintenance log not found.' });

    if (req.body.status === 'Completed' && log.status !== 'Completed') {
      log.completedDate = new Date();
      // Restore vehicle to Available
      await Vehicle.findByIdAndUpdate(log.vehicle, { status: 'Available' });
    }

    Object.assign(log, req.body);
    await log.save();

    const populated = await Maintenance.findById(log._id)
      .populate('vehicle', 'name licensePlate type');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete maintenance log
router.delete('/:id', auth, async (req, res) => {
  try {
    const log = await Maintenance.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ message: 'Maintenance log not found.' });
    res.json({ message: 'Maintenance log deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
