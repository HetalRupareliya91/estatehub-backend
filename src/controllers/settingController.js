const { Setting } = require('../models');

const DEFAULTS = {
  companyName: 'EstateHub Realty',
  currency: 'USD',
  timezone: 'UTC',
};

// @route GET /api/settings
async function getSettings(req, res, next) {
  try {
    const rows = await Setting.findAll();
    const settings = { ...DEFAULTS };
    rows.forEach((row) => { settings[row.key] = row.value; });
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

// @route PUT /api/settings/:key
async function updateSetting(req, res, next) {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ message: 'value is required' });
    }

    const [setting] = await Setting.findOrCreate({
      where: { key },
      defaults: { value },
    });
    setting.value = value;
    await setting.save();

    res.json(setting);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSettings, updateSetting };

