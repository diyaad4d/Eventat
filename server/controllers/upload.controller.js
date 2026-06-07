const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// ---------------------------------------------------------------------------
// UPLOADS DIRECTORY
// vendors.controller.js uses: path.join(__dirname, '../../uploads')
// index.js serves:            path.join(__dirname, '../uploads')
// Both resolve to <project-root>/uploads — so we match that exact path.
// ---------------------------------------------------------------------------
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ---------------------------------------------------------------------------
// SHARED DISK STORAGE
// Filename format matches vendors.controller.js for consistency:
//   `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
// ---------------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => {
    const ext      = path.extname(file.originalname).toLowerCase();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, filename);
  },
});

// ---------------------------------------------------------------------------
// CONFIG A: uploadDocsConfig
// Accepts: PDF, JPEG, PNG
// Limit:   10 MB per file
// Max files per request handled in the route (.array('documents', 5))
// ---------------------------------------------------------------------------
const docsFileFilter = (req, file, cb) => {
  const allowedMimetypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowedMimetypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Pass an Error — multer will forward it to handleMulterError in the route
    cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed for documents.'));
  }
};

const uploadDocsConfig = multer({
  storage,
  fileFilter: docsFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ---------------------------------------------------------------------------
// CONFIG B: uploadImagesConfig
// Accepts: JPEG, PNG, WebP
// Limit:   5 MB per file
// Max files per request handled in the route (.array('images', 10))
// ---------------------------------------------------------------------------
const imagesFileFilter = (req, file, cb) => {
  const allowedMimetypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimetypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
  }
};

const uploadImagesConfig = multer({
  storage,
  fileFilter: imagesFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ---------------------------------------------------------------------------
// FUNCTION 1: POST /api/upload/documents
// Receives up to 5 document files (PDF/JPEG/PNG), saves to disk, returns URLs.
// Does NOT write to database — callers (e.g. vendors.controller) save the URLs.
// ---------------------------------------------------------------------------
const returnUploadedDocuments = async (req, res, next) => {
  try {
    // multer .array() populates req.files — check it isn't empty
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No documents uploaded.',
      });
    }

    // Build URL array in the same /uploads/<filename> format used by vendors.controller.js
    const fileUrls = req.files.map(f => `/uploads/${f.filename}`);

    return res.status(201).json({
      success: true,
      message: 'Documents uploaded.',
      data: { urls: fileUrls },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// FUNCTION 2: POST /api/upload/images
// Receives up to 10 image files (JPEG/PNG/WebP), saves to disk, returns URLs.
// Does NOT write to database — callers (e.g. vendors.controller) save the URLs.
// ---------------------------------------------------------------------------
const returnUploadedImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No images uploaded.',
      });
    }

    const fileUrls = req.files.map(f => `/uploads/${f.filename}`);

    return res.status(201).json({
      success: true,
      message: 'Images uploaded.',
      data: { urls: fileUrls },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadDocsConfig,
  uploadImagesConfig,
  returnUploadedDocuments,
  returnUploadedImages,
};
