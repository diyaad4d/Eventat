const express    = require('express');
const router     = express.Router();
const uploadCtrl = require('../controllers/upload.controller');

// ── Auth middleware — DEFAULT export (no destructuring!) ──────────────────
// auth.middleware.js: module.exports = authMiddleware  (verified in file)
const verifyToken = require('../middleware/auth.middleware');

// ---------------------------------------------------------------------------
// LOCAL MULTER ERROR HANDLER
// Multer throws errors synchronously inside its middleware, which means they
// do NOT naturally reach Express's 4-arg errorHandler. To catch them safely,
// we use a dedicated inline error-handling middleware inserted into each route.
//
// Why not just next(err)?
//   Multer calls cb(new Error(...)) inside fileFilter, which makes multer throw
//   a MulterError or a generic Error BEFORE our controller runs. This middleware
//   intercepts that error and responds immediately with a 400 — preventing a
//   server crash and returning a clean JSON response.
// ---------------------------------------------------------------------------
const handleMulterError = (err, req, res, next) => {
  if (err) {
    // Clean up any files that were partially saved before the error
    if (req.files && req.files.length > 0) {
      const fs   = require('fs');
      const path = require('path');
      req.files.forEach(file => {
        fs.unlink(file.path, (unlinkErr) => {
          if (unlinkErr) console.error('[Upload Cleanup Error]', unlinkErr.message);
        });
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message || 'File upload failed.',
    });
  }
  next();
};

// ---------------------------------------------------------------------------
// ROUTE 1: POST /api/upload/documents
// ─────────────────────────────────────────────────────────────────────────
// Auth required — only authenticated users (vendors) can upload documents.
// Accepts field name 'documents', max 5 files.
// Allowed types: PDF, JPEG, PNG  |  Limit: 10 MB each (enforced in controller)
// handleMulterError catches fileFilter rejections before controller runs.
// ---------------------------------------------------------------------------
router.post('/upload/documents',
  verifyToken,
  uploadCtrl.uploadDocsConfig.array('documents', 5),
  handleMulterError,
  uploadCtrl.returnUploadedDocuments
);

// ---------------------------------------------------------------------------
// ROUTE 2: POST /api/upload/images
// ─────────────────────────────────────────────────────────────────────────
// Auth required — only authenticated users (vendors) can upload service images.
// Accepts field name 'images', max 10 files.
// Allowed types: JPEG, PNG, WebP  |  Limit: 5 MB each (enforced in controller)
// handleMulterError catches fileFilter rejections before controller runs.
// ---------------------------------------------------------------------------
router.post('/upload/images',
  verifyToken,
  uploadCtrl.uploadImagesConfig.array('images', 10),
  handleMulterError,
  uploadCtrl.returnUploadedImages
);

module.exports = router;
