const express = require('express');
const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const { auth, authorize } = require('../middleware/auth');
const { validate, validateTrip } = require('../middleware/validate');
const router = express.Router();

// Get all trips (user-scoped)
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { createdBy: req.user._id };
    if (status) filter.status = status;
    const trips = await Trip.find(filter)
      .populate('vehicle', 'name licensePlate type maxCapacity')
      .populate('driver', 'name licenseNumber status')
      .sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create trip with validation (manager, dispatcher only)
router.post('/', auth, authorize('manager', 'dispatcher'), validate(validateTrip), async (req, res) => {
  try {
    const { vehicle: vehicleId, driver: driverId, cargoWeight } = req.body;

    const vehicle = await Vehicle.findOne({ _id: vehicleId, createdBy: req.user._id });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
    if (vehicle.status !== 'Available') return res.status(400).json({ message: `Vehicle is currently "${vehicle.status}" and cannot be assigned.` });
    if (cargoWeight > vehicle.maxCapacity) {
      return res.status(400).json({ message: `Cargo weight (${cargoWeight}kg) exceeds vehicle capacity (${vehicle.maxCapacity}kg).` });
    }

    const driver = await Driver.findOne({ _id: driverId, createdBy: req.user._id });
    if (!driver) return res.status(404).json({ message: 'Driver not found.' });
    if (driver.status === 'On Trip') return res.status(400).json({ message: 'Driver is already on a trip.' });
    if (driver.status === 'Suspended') return res.status(400).json({ message: 'Driver is suspended.' });
    if (driver.licenseExpiry < new Date()) return res.status(400).json({ message: 'Driver license has expired.' });
    if (!driver.licenseCategory.includes(vehicle.type)) {
      return res.status(400).json({ message: `Driver is not licensed for ${vehicle.type} vehicles.` });
    }

    const trip = await Trip.create({ ...req.body, startOdometer: vehicle.odometer, createdBy: req.user._id });

    // Update statuses
    await Vehicle.findByIdAndUpdate(vehicleId, { status: 'On Trip' });
    await Driver.findByIdAndUpdate(driverId, { status: 'On Trip' });

    const populated = await Trip.findById(trip._id)
      .populate('vehicle', 'name licensePlate type maxCapacity')
      .populate('driver', 'name licenseNumber');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update trip status (lifecycle management, owner only)
router.put('/:id', auth, authorize('manager', 'dispatcher'), async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found or access denied.' });

    const { status, endOdometer } = req.body;

    if (status === 'Completed') {
      trip.status = 'Completed';
      trip.completedDate = new Date();
      if (endOdometer) trip.endOdometer = endOdometer;

      await Vehicle.findByIdAndUpdate(trip.vehicle, {
        status: 'Available',
        ...(endOdometer && { odometer: endOdometer }),
      });
      await Driver.findByIdAndUpdate(trip.driver, { status: 'On Duty' });
      const driver = await Driver.findById(trip.driver);
      if (driver) {
        driver.tripsCompleted += 1;
        await driver.save();
      }
    } else if (status === 'Cancelled') {
      trip.status = 'Cancelled';
      await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'Available' });
      await Driver.findByIdAndUpdate(trip.driver, { status: 'On Duty' });
      const driver = await Driver.findById(trip.driver);
      if (driver) {
        driver.tripsCancelled += 1;
        driver.safetyScore = Math.max(0, driver.safetyScore - 2);
        await driver.save();
      }
    } else if (status === 'Dispatched' && trip.status === 'Draft') {
      trip.status = 'Dispatched';
    } else {
      Object.assign(trip, req.body);
    }

    await trip.save();
    const populated = await Trip.findById(trip._id)
      .populate('vehicle', 'name licensePlate type maxCapacity')
      .populate('driver', 'name licenseNumber');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete trip (owner only, manager only)
router.delete('/:id', auth, authorize('manager'), async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found or access denied.' });
    if (trip.status === 'Dispatched') {
      await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'Available' });
      await Driver.findByIdAndUpdate(trip.driver, { status: 'On Duty' });
    }
    await Trip.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trip deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
