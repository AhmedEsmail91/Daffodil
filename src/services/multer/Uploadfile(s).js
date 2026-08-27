const path = require('path');
const multer = require('multer');
const { getBucket, isStorageEnabled } = require('../../../config/firebase.js');

const memoryStorage = multer.memoryStorage();

const fileFilterFor = (type) => (req, file, cb) => {
  if (file.mimetype.startsWith(type)) {
    cb(null, true);
  } else {
    cb(new Error(`Only ${type} allowed`), false);
  }
};

/**
 * Uploads a single multer in-memory file buffer to Firebase Cloud Storage and
 * returns its public download URL. `uploadPath` keeps the same folder-path
 * convention the old disk-storage code used (e.g. "Chats/images").
 */
const uploadBufferToStorage = async (file, uploadPath) => {
  if (!isStorageEnabled()) {
    throw new Error('File storage is not configured (Firebase Storage is disabled) — cannot upload files.');
  }
  const bucket = getBucket();
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const objectPath = `${uploadPath}/${uniqueSuffix}${path.extname(file.originalname)}`.replace(/\\/g, '/');
  const blob = bucket.file(objectPath);
  await blob.save(file.buffer, {
    metadata: { contentType: file.mimetype },
    public: true,
    resumable: false,
  });
  return blob.publicUrl();
};

/**
 * Middleware factory: after multer has parsed the multipart request into
 * req.file/req.files (in memory), upload each file's buffer to Storage and
 * attach the resulting download URL as `.url` on the file object so
 * downstream controllers can persist a real absolute URL.
 */
const processUploadedFiles = (uploadPath) => async (req, res, next) => {
  try {
    if (req.file) {
      req.file.url = await uploadBufferToStorage(req.file, uploadPath);
    }
    if (req.files) {
      if (Array.isArray(req.files)) {
        for (const file of req.files) {
          file.url = await uploadBufferToStorage(file, uploadPath);
        }
      } else {
        for (const fieldName of Object.keys(req.files)) {
          for (const file of req.files[fieldName]) {
            file.url = await uploadBufferToStorage(file, uploadPath);
          }
        }
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};

// For uploading a single file with a path
/**
 *
 * @param {string} fieldName Adding the input name of the front-end (postman)
 * @param {string} uploadPath ex: 'customer/cart'
 * @param {string} type ex: 'image' or 'video' or 'audio'
 * @example
 * fieldName = 'cartItem',
 * uploadPath = 'customer/cart',
 * type = 'image'
 * @returns  {Function[]} Multer + Storage-upload middleware chain for a single file upload
 */
const uploadSingleFile = (fieldName, uploadPath, type = "image") => {
  const multerMw = multer({ storage: memoryStorage, fileFilter: fileFilterFor(type) }).single(fieldName);
  return [multerMw, processUploadedFiles(uploadPath)];
};

// For uploading multiple files with a path
/**
 *
 * @param {string} fieldName Adding the input name of the front-end (postman)
 * @param {string} uploadPath ex: 'customer/cart'
 * @param {string} type ex: 'image' or 'video' or 'audio'
 * @example
 * fieldName = 'images',
 * uploadPath = 'customer/cart',
 * type = 'image'
 * @returns  {Function[]} Multer + Storage-upload middleware chain for multiple file uploads
 */
const uploadArrayOfFiles = (fieldName, uploadPath, type = "image") => {
  const multerMw = multer({ storage: memoryStorage, fileFilter: fileFilterFor(type) }).array(fieldName, 30);
  return [multerMw, processUploadedFiles(uploadPath)];
};

// For uploading fields with multiple files, each field can have a different name
/**
 *
 * @param {array} fields [{ fieldName, maxCount }, { fieldName, maxCount }, ...] ex: [{ name, 1 }, { image, 5 }]
 * @param {string} uploadPath ex: 'customer/cart'
 * @param {string} type ex: 'image' or 'video' or 'audio'
 * @example
 * fields = [
 *   { name: 'avatar', maxCount: 1 },
 *   { name: 'gallery', maxCount: 5 }
 * ],
 * uploadPath = 'customer/cart',
 * type = 'image'
 * @returns  {Function[]} Multer + Storage-upload middleware chain for multi-field file uploads
 */
const uploadFields = (fields, uploadPath, type = "image") => {
  const multerMw = multer({ storage: memoryStorage, fileFilter: fileFilterFor(type) }).fields(fields);
  return [multerMw, processUploadedFiles(uploadPath)];
};
module.exports = {
  uploadSingleFile,
  uploadArrayOfFiles,
  uploadFields
}
