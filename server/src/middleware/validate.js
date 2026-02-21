/**
 * Reusable server-side input validation helpers.
 * Each validator returns { valid, errors } where errors is an array of strings.
 */

const validators = {
  isEmail: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  isNonEmpty: (v) => typeof v === 'string' && v.trim().length > 0,
  isPositiveNum: (v) => typeof v === 'number' && v > 0,
  isNonNegativeNum: (v) => typeof v === 'number' && v >= 0,
  isIn: (v, arr) => arr.includes(v),
  isMongoId: (v) => /^[a-fA-F0-9]{24}$/.test(v),
  isDate: (v) => !isNaN(new Date(v).getTime()),
  isPhone: (v) => /^[\d\s+\-()]{7,20}$/.test(v),
};

function validateRegister(body) {
  const errors = [];
  if (!validators.isNonEmpty(body.name)) errors.push('Name is required.');
  if (!validators.isNonEmpty(body.email) || !validators.isEmail(body.email)) errors.push('A valid email is required.');
  if (!body.password || body.password.length < 6) errors.push('Password must be at least 6 characters.');
  if (body.role && !validators.isIn(body.role, ['manager', 'dispatcher', 'safety_officer', 'analyst'])) {
    errors.push('Invalid role. Must be manager, dispatcher, safety_officer, or analyst.');
  }
  return { valid: errors.length === 0, errors };
}

function validateLogin(body) {
  const errors = [];
  if (!validators.isNonEmpty(body.email)) errors.push('Email is required.');
  if (!validators.isNonEmpty(body.password)) errors.push('Password is required.');
  return { valid: errors.length === 0, errors };
}

function validateVehicle(body) {
  const errors = [];
  if (!validators.isNonEmpty(body.name)) errors.push('Vehicle name is required.');
  if (!validators.isNonEmpty(body.model)) errors.push('Vehicle model is required.');
  if (!validators.isNonEmpty(body.licensePlate)) errors.push('License plate is required.');
  if (!validators.isIn(body.type, ['Truck', 'Van', 'Bike'])) errors.push('Type must be Truck, Van, or Bike.');
  if (!validators.isPositiveNum(Number(body.maxCapacity))) errors.push('Max capacity must be a positive number.');
  if (body.odometer !== undefined && !validators.isNonNegativeNum(Number(body.odometer))) errors.push('Odometer must be a non-negative number.');
  return { valid: errors.length === 0, errors };
}

function validateDriver(body) {
  const errors = [];
  if (!validators.isNonEmpty(body.name)) errors.push('Driver name is required.');
  if (!validators.isNonEmpty(body.email) || !validators.isEmail(body.email)) errors.push('A valid email is required.');
  if (!validators.isNonEmpty(body.phone) || !validators.isPhone(body.phone)) errors.push('A valid phone number is required.');
  if (!validators.isNonEmpty(body.licenseNumber)) errors.push('License number is required.');
  if (!Array.isArray(body.licenseCategory) || body.licenseCategory.length === 0) {
    errors.push('At least one license category is required.');
  } else if (!body.licenseCategory.every(c => ['Truck', 'Van', 'Bike'].includes(c))) {
    errors.push('License categories must be Truck, Van, or Bike.');
  }
  if (!body.licenseExpiry || !validators.isDate(body.licenseExpiry)) errors.push('A valid license expiry date is required.');
  if (body.safetyScore !== undefined) {
    const s = Number(body.safetyScore);
    if (isNaN(s) || s < 0 || s > 100) errors.push('Safety score must be 0-100.');
  }
  return { valid: errors.length === 0, errors };
}

function validateTrip(body) {
  const errors = [];
  if (!validators.isNonEmpty(body.vehicle) || !validators.isMongoId(body.vehicle)) errors.push('A valid vehicle is required.');
  if (!validators.isNonEmpty(body.driver) || !validators.isMongoId(body.driver)) errors.push('A valid driver is required.');
  if (!validators.isNonEmpty(body.origin)) errors.push('Origin is required.');
  if (!validators.isNonEmpty(body.destination)) errors.push('Destination is required.');
  if (!validators.isPositiveNum(Number(body.cargoWeight))) errors.push('Cargo weight must be a positive number.');
  if (!body.scheduledDate || !validators.isDate(body.scheduledDate)) errors.push('A valid scheduled date is required.');
  return { valid: errors.length === 0, errors };
}

function validateMaintenance(body) {
  const errors = [];
  if (!validators.isNonEmpty(body.vehicle) || !validators.isMongoId(body.vehicle)) errors.push('A valid vehicle is required.');
  if (!validators.isIn(body.type, ['Preventive', 'Reactive', 'Inspection'])) errors.push('Type must be Preventive, Reactive, or Inspection.');
  if (!validators.isNonEmpty(body.description)) errors.push('Description is required.');
  if (!validators.isNonNegativeNum(Number(body.cost))) errors.push('Cost must be a non-negative number.');
  if (!body.scheduledDate || !validators.isDate(body.scheduledDate)) errors.push('A valid scheduled date is required.');
  return { valid: errors.length === 0, errors };
}

function validateExpense(body) {
  const errors = [];
  if (!validators.isNonEmpty(body.vehicle) || !validators.isMongoId(body.vehicle)) errors.push('A valid vehicle is required.');
  if (!validators.isIn(body.category, ['Fuel', 'Maintenance', 'Insurance', 'Toll', 'Other'])) errors.push('Invalid expense category.');
  if (!validators.isPositiveNum(Number(body.amount))) errors.push('Amount must be a positive number.');
  if (!body.date || !validators.isDate(body.date)) errors.push('A valid date is required.');
  if (body.liters !== undefined && Number(body.liters) < 0) errors.push('Liters must be non-negative.');
  return { valid: errors.length === 0, errors };
}

/**
 * Express middleware factory. Usage: validate(validateVehicle)
 */
function validate(validatorFn) {
  return (req, res, next) => {
    const { valid, errors } = validatorFn(req.body);
    if (!valid) return res.status(400).json({ message: errors.join(' ') });
    next();
  };
}

module.exports = {
  validators,
  validate,
  validateRegister,
  validateLogin,
  validateVehicle,
  validateDriver,
  validateTrip,
  validateMaintenance,
  validateExpense,
};
