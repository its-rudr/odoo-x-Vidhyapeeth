const express = require('express');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Maintenance = require('../models/Maintenance');
const Expense = require('../models/Expense');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Dashboard KPIs
router.get('/dashboard', auth, async (req, res) => {
  try {
    const [vehicles, drivers, trips, expenses] = await Promise.all([
      Vehicle.find(),
      Driver.find(),
      Trip.find(),
      Expense.find(),
    ]);

    const activeFleet = vehicles.filter(v => v.status === 'On Trip').length;
    const maintenanceAlerts = vehicles.filter(v => v.status === 'In Shop').length;
    const available = vehicles.filter(v => v.status === 'Available').length;
    const totalVehicles = vehicles.length;
    const utilizationRate = totalVehicles > 0 ? Math.round(((totalVehicles - available) / totalVehicles) * 100) : 0;
    const pendingCargo = trips.filter(t => t.status === 'Draft').length;
    const completedTrips = trips.filter(t => t.status === 'Completed').length;
    const activeDrivers = drivers.filter(d => d.status === 'On Duty' || d.status === 'On Trip').length;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const fuelExpenses = expenses.filter(e => e.category === 'Fuel').reduce((sum, e) => sum + e.amount, 0);

    // Recent trips
    const recentTrips = await Trip.find()
      .populate('vehicle', 'name licensePlate')
      .populate('driver', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Vehicle status distribution
    const statusDistribution = {
      Available: available,
      'On Trip': activeFleet,
      'In Shop': maintenanceAlerts,
      'Out of Service': vehicles.filter(v => v.status === 'Out of Service').length,
    };

    // Vehicle type distribution
    const typeDistribution = {};
    vehicles.forEach(v => {
      typeDistribution[v.type] = (typeDistribution[v.type] || 0) + 1;
    });

    res.json({
      kpis: { activeFleet, maintenanceAlerts, utilizationRate, pendingCargo, completedTrips, activeDrivers, totalVehicles, totalExpenses, fuelExpenses },
      recentTrips,
      statusDistribution,
      typeDistribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Analytics data
router.get('/analytics', auth, async (req, res) => {
  try {
    const [vehicles, trips, expenses, maintenanceLogs] = await Promise.all([
      Vehicle.find(),
      Trip.find({ status: 'Completed' }).populate('vehicle', 'name licensePlate acquisitionCost'),
      Expense.find().populate('vehicle', 'name licensePlate'),
      Maintenance.find().populate('vehicle', 'name licensePlate'),
    ]);

    // Fuel efficiency per vehicle
    const fuelEfficiency = {};
    const vehicleCosts = {};

    expenses.forEach(exp => {
      if (!exp.vehicle) return;
      const vid = exp.vehicle._id.toString();
      if (!vehicleCosts[vid]) {
        vehicleCosts[vid] = { name: exp.vehicle.name, plate: exp.vehicle.licensePlate, fuel: 0, maintenance: 0, liters: 0, km: 0 };
      }
      if (exp.category === 'Fuel') {
        vehicleCosts[vid].fuel += exp.amount;
        vehicleCosts[vid].liters += exp.liters;
      }
    });

    maintenanceLogs.forEach(m => {
      if (!m.vehicle) return;
      const vid = m.vehicle._id.toString();
      if (!vehicleCosts[vid]) {
        vehicleCosts[vid] = { name: m.vehicle.name, plate: m.vehicle.licensePlate, fuel: 0, maintenance: 0, liters: 0, km: 0 };
      }
      vehicleCosts[vid].maintenance += m.cost;
    });

    trips.forEach(t => {
      if (!t.vehicle) return;
      const vid = t.vehicle._id.toString();
      if (vehicleCosts[vid] && t.endOdometer > t.startOdometer) {
        vehicleCosts[vid].km += (t.endOdometer - t.startOdometer);
      }
    });

    // Calculate fuel efficiency and ROI
    const vehicleAnalytics = Object.values(vehicleCosts).map(v => ({
      ...v,
      fuelEfficiency: v.liters > 0 ? (v.km / v.liters).toFixed(2) : 'N/A',
      totalCost: v.fuel + v.maintenance,
      costPerKm: v.km > 0 ? ((v.fuel + v.maintenance) / v.km).toFixed(2) : 'N/A',
    }));

    // Monthly expense trend
    const monthlyExpenses = {};
    expenses.forEach(exp => {
      const month = new Date(exp.date).toISOString().slice(0, 7);
      if (!monthlyExpenses[month]) monthlyExpenses[month] = { fuel: 0, maintenance: 0, other: 0 };
      if (exp.category === 'Fuel') monthlyExpenses[month].fuel += exp.amount;
      else if (exp.category === 'Maintenance') monthlyExpenses[month].maintenance += exp.amount;
      else monthlyExpenses[month].other += exp.amount;
    });

    const expenseTrend = Object.entries(monthlyExpenses)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data, total: data.fuel + data.maintenance + data.other }));

    res.json({
      vehicleAnalytics,
      expenseTrend,
      summary: {
        totalFuelCost: Object.values(vehicleCosts).reduce((s, v) => s + v.fuel, 0),
        totalMaintenanceCost: Object.values(vehicleCosts).reduce((s, v) => s + v.maintenance, 0),
        totalKm: Object.values(vehicleCosts).reduce((s, v) => s + v.km, 0),
        totalLiters: Object.values(vehicleCosts).reduce((s, v) => s + v.liters, 0),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
