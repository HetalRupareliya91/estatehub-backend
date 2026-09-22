const { Op } = require('sequelize');
const { Listing, User, Lead } = require('../models');

// @route GET /api/listings
// Supports optional filters: status, propertyType, city, minPrice, maxPrice, agentId, search
// Supports pagination: page (default 1), limit (default 10, max 100)
async function getListings(req, res, next) {
  try {
    const { status, propertyType, city, minPrice, maxPrice, agentId, search } = req.query;

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const offset = (page - 1) * limit;

    const where = {};

    if (status) where.status = status;
    if (propertyType) where.propertyType = propertyType;
    if (agentId) where.agentId = agentId;
    if (city) where.city = { [Op.iLike]: `%${city}%` };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await Listing.findAndCountAll({
      where,
      include: [{ model: User, as: 'agent', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true, // keep the count accurate with the join above
    });

    res.json({
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.max(Math.ceil(count / limit), 1),
      },
    });
  } catch (err) {
    next(err);
  }
}

// @route GET /api/listings/:id
async function getListingById(req, res, next) {
  try {
    const listing = await Listing.findByPk(req.params.id, {
      include: [
        { model: User, as: 'agent', attributes: ['id', 'name', 'email'] },
        { model: Lead, as: 'interestedLeads' },
      ],
    });
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    next(err);
  }
}

// @route POST /api/listings
async function createListing(req, res, next) {
  try {
    const {
      title, description, propertyType, status, price,
      address, city, state, zipCode, bedrooms, bathrooms,
      areaSqft, imageUrl, agentId,
    } = req.body;

    if (!title || !price || !address || !city) {
      return res.status(400).json({ message: 'title, price, address and city are required' });
    }

    const listing = await Listing.create({
      title, description, propertyType, status, price,
      address, city, state, zipCode, bedrooms, bathrooms,
      areaSqft, imageUrl,
      agentId: agentId || req.user.id,
    });

    res.status(201).json(listing);
  } catch (err) {
    next(err);
  }
}

// @route PATCH /api/listings/:id
async function updateListing(req, res, next) {
  try {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    const fields = [
      'title', 'description', 'propertyType', 'status', 'price',
      'address', 'city', 'state', 'zipCode', 'bedrooms', 'bathrooms',
      'areaSqft', 'imageUrl', 'agentId',
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) listing[field] = req.body[field];
    });

    await listing.save();
    res.json(listing);
  } catch (err) {
    next(err);
  }
}

// @route DELETE /api/listings/:id
async function deleteListing(req, res, next) {
  try {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    await listing.destroy();
    res.json({ message: 'Listing removed' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
};
