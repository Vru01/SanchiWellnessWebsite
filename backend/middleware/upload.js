const multer = require('multer');

// Store file in memory as a buffer rather than writing to disk
const storage = multer.memoryStorage();

// Ensure only images get through
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Accept file
    } else {
        cb(new Error('Not an image! Please upload only images.'), false); // Reject file
    }
};

// Configure Multer
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB file size limit per image
    }
});

module.exports = upload;