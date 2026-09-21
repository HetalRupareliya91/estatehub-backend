const { Document } = require('../models');

// @route GET /api/documents
async function getDocuments(req, res, next) {
  try {
    const { relatedType, relatedId } = req.query;
    const where = {};
    if (relatedType) where.relatedType = relatedType;
    if (relatedId) where.relatedId = relatedId;

    const documents = await Document.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(documents);
  } catch (err) {
    next(err);
  }
}

// @route POST /api/documents
async function uploadDocument(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { relatedType, relatedId } = req.body;
    const document = await Document.create({
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      relatedType: relatedType || null,
      relatedId: relatedId || null,
      uploadedBy: req.user.id,
    });
    res.status(201).json(document);
  } catch (err) {
    next(err);
  }
}

// @route DELETE /api/documents/:id
async function deleteDocument(req, res, next) {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    await document.destroy();
    res.json({ message: 'Document removed' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDocuments, uploadDocument, deleteDocument };

