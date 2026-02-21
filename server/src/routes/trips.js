const express = require('express');
const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const { auth } = require('../middleware/auth');
const { validate, validateTrip } = require('../middleware/validate');
const router = express.Router();

// Get all trips
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
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

// Create trip with validation
router.post('/', auth, validate(validateTrip), async (req, res) => {
  try {
    const { vehicle: vehicleId, driver: driverId, cargoWeight } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
    if (vehicle.status !== 'Available') return res.status(400).json({ message: `Vehicle is currently "${vehicle.status}" and cannot be assigned.` });
    if (cargoWeight > vehicle.maxCapacity) {
      return res.status(400).json({ message: `Cargo weight (${cargoWeight}kg) exceeds vehicle capacity (${vehicle.maxCapacity}kg).` });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) return res.status(404).json({ message: 'Driver not found.' });
    if (driver.status === 'On Trip') return res.status(400).json({ message: 'Driver is already on a trip.' });
    if (driver.status === 'Suspended') return res.status(400).json({ message: 'Driver is suspended.' });
    if (driver.licenseExpiry < new Date()) return res.status(400).json({ message: 'Driver license has expired.' });
    if (!driver.licenseCategory.includes(vehicle.type)) {
      return res.status(400).json({ message: `Driver is not licensed for ${vehicle.type} vehicles.` });
    }

    const trip = await Trip.create({ ...req.body, startOdometer: vehicle.odometer });

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

// Update trip status (lifecycle management)
router.put('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });

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

// Delete trip
router.delete('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
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
