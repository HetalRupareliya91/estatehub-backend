const { Lead, Listing, Commission } = require('../models');
const { toCsv } = require('../utils/csvExport');

function sendCsv(res, filename, csv) {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}

// @route GET /api/export/leads.csv
async function exportLeads(req, res, next) {
  try {
    const leads = await Lead.findAll({ raw: true });
    const csv = toCsv(leads, [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'source', label: 'Source' },
      { key: 'stage', label: 'Stage' },
      { key: 'interestType', label: 'Interest' },
      { key: 'budget', label: 'Budget' },
      { key: 'createdAt', label: 'Created' },
    ]);
    sendCsv(res, 'leads.csv', csv);
  } catch (err) {
    next(err);
  }
}

// @route GET /api/export/listings.csv
async function exportListings(req, res, next) {
  try {
    const listings = await Listing.findAll({ raw: true });
    const csv = toCsv(listings, [
      { key: 'title', label: 'Title' },
      { key: 'address', label: 'Address' },
      { key: 'city', label: 'City' },
      { key: 'propertyType', label: 'Type' },
      { key: 'status', label: 'Status' },
      { key: 'price', label: 'Price' },
      { key: 'createdAt', label: 'Created' },
    ]);
    sendCsv(res, 'listings.csv', csv);
  } catch (err) {
    next(err);
  }
}

// @route GET /api/export/commissions.csv
async function exportCommissions(req, res, next) {
  try {
    const commissions = await Commission.findAll({ raw: true });
    const csv = toCsv(commissions, [
      { key: 'saleAmount', label: 'Sale amount' },
      { key: 'commissionRate', label: 'Rate (%)' },
      { key: 'commissionAmount', label: 'Commission' },
      { key: 'status', label: 'Status' },
      { key: 'paidAt', label: 'Paid at' },
      { key: 'createdAt', label: 'Created' },
    ]);
    sendCsv(res, 'commissions.csv', csv);
  } catch (err) {
    next(err);
  }
}

module.exports = { exportLeads, exportListings, exportCommissions };

