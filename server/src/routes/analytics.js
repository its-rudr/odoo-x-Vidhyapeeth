const express = require('express');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Maintenance = require('../models/Maintenance');
const Expense = require('../models/Expense');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Dashboard KPIs (org-shared, role-aware, filterable)
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userRole = req.user.role;
    const { type, status, region } = req.query;

    // Build vehicle filter from query params
    const vehicleFilter = {};
    if (type) vehicleFilter.type = type;
    if (status) vehicleFilter.status = status;
    if (region) vehicleFilter.region = region;

    const [vehicles, drivers, trips, expenses, maintenanceLogs] = await Promise.all([
      Vehicle.find(vehicleFilter),
      Driver.find(),
      Trip.find(),
      Expense.find(),
      Maintenance.find().populate('vehicle', 'name licensePlate'),
    ]);

    const activeFleet = vehicles.filter(v => v.status === 'On Trip').length;
    const maintenanceAlerts = vehicles.filter(v => v.status === 'In Shop').length;
    const available = vehicles.filter(v => v.status === 'Available').length;
    const totalVehicles = vehicles.length;
    const utilizationRate = totalVehicles > 0 ? Math.round(((totalVehicles - available) / totalVehicles) * 100) : 0;
    const pendingCargo = trips.filter(t => t.status === 'Draft').length;
    const dispatchedTrips = trips.filter(t => t.status === 'Dispatched').length;
    const completedTrips = trips.filter(t => t.status === 'Completed').length;
    const cancelledTrips = trips.filter(t => t.status === 'Cancelled').length;
    const activeDrivers = drivers.filter(d => d.status === 'On Duty' || d.status === 'On Trip').length;
    const totalDrivers = drivers.length;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const fuelExpenses = expenses.filter(e => e.category === 'Fuel').reduce((sum, e) => sum + e.amount, 0);
    const maintenanceExpenses = expenses.filter(e => e.category === 'Maintenance').reduce((sum, e) => sum + e.amount, 0);
    const insuranceExpenses = expenses.filter(e => e.category === 'Insurance').reduce((sum, e) => sum + e.amount, 0);

    // Recent trips (org-shared)
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

    // Base response
    const response = {
      kpis: { activeFleet, maintenanceAlerts, utilizationRate, pendingCargo, completedTrips, activeDrivers, totalVehicles, totalExpenses, fuelExpenses, totalDrivers, dispatchedTrips, cancelledTrips, maintenanceExpenses, insuranceExpenses },
      recentTrips,
      statusDistribution,
      typeDistribution,
      userRole,
    };

    // Safety Officer extras: driver compliance data
    if (userRole === 'safety_officer' || userRole === 'manager') {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      response.driverCompliance = {
        expiringLicenses: drivers.filter(d => d.licenseExpiry && d.licenseExpiry <= thirtyDaysFromNow && d.licenseExpiry > now).map(d => ({
          _id: d._id, name: d.name, licenseExpiry: d.licenseExpiry, licenseNumber: d.licenseNumber,
        })),
        expiredLicenses: drivers.filter(d => d.licenseExpiry && d.licenseExpiry <= now).map(d => ({
          _id: d._id, name: d.name, licenseExpiry: d.licenseExpiry, licenseNumber: d.licenseNumber,
        })),
        lowSafetyScores: drivers.filter(d => d.safetyScore < 70).map(d => ({
          _id: d._id, name: d.name, safetyScore: d.safetyScore,
        })),
        avgSafetyScore: totalDrivers > 0 ? Math.round(drivers.reduce((s, d) => s + d.safetyScore, 0) / totalDrivers) : 0,
        suspendedDrivers: drivers.filter(d => d.status === 'Suspended').length,
      };

      response.maintenanceSummary = {
        scheduled: maintenanceLogs.filter(m => m.status === 'Scheduled').length,
        inProgress: maintenanceLogs.filter(m => m.status === 'In Progress').length,
        completed: maintenanceLogs.filter(m => m.status === 'Completed').length,
        totalCost: maintenanceLogs.reduce((s, m) => s + m.cost, 0),
        recentLogs: maintenanceLogs.slice(0, 5).map(m => ({
          _id: m._id, type: m.type, status: m.status, cost: m.cost,
          vehicleName: m.vehicle?.name || 'N/A', vehiclePlate: m.vehicle?.licensePlate || 'N/A',
        })),
      };
    }

    // Financial Analyst extras: expense breakdown
    if (userRole === 'analyst' || userRole === 'manager') {
      const expenseByCategory = {};
      expenses.forEach(e => {
        expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount;
      });

      response.expenseBreakdown = {
        byCategory: expenseByCategory,
        avgPerVehicle: totalVehicles > 0 ? Math.round(totalExpenses / totalVehicles) : 0,
        recentExpenses: expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map(e => ({
          _id: e._id, category: e.category, amount: e.amount, date: e.date, description: e.description,
        })),
      };
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Analytics data (user-scoped)
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

    // Add acquisition cost from vehicle records
    vehicles.forEach(v => {
      const vid = v._id.toString();
      if (vehicleCosts[vid]) {
        vehicleCosts[vid].acquisitionCost = v.acquisitionCost || 0;
      }
    });

    // Calculate fuel efficiency and ROI
    const vehicleAnalytics = Object.values(vehicleCosts).map(v => {
      const totalCost = v.fuel + v.maintenance;
      const roi = v.acquisitionCost > 0 ? (((v.km * 10) - totalCost) / v.acquisitionCost * 100).toFixed(1) : 'N/A';
      return {
        ...v,
        fuelEfficiency: v.liters > 0 ? (v.km / v.liters).toFixed(2) : 'N/A',
        totalCost,
        costPerKm: v.km > 0 ? (totalCost / v.km).toFixed(2) : 'N/A',
        roi,
      };
    });

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
