const fs = require('fs');
const path = require('path');
const multer = require('multer');
const appRoot = path.resolve(__dirname, '../../../');
const uploadFilePath = path.join(appRoot, 'uploads/');

const fileUpload = (uploadPath = '',type) => {
  const fullPath = path.join('uploads', uploadPath);

  // ✅ Ensure the folder exists
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith(type)) {
      cb(null, true);
    } else {
      cb(new Error(`Only ${type} allowed`), false);
    }
  };

  return multer({ storage, fileFilter });
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
 * @returns  {Function} Returns a multer middleware function for handling single file uploads
 */
const uploadSingleFile = (fieldName, uploadPath, type="image") => {
  return fileUpload(uploadPath,type).single(fieldName);
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
 * @returns  {Function} Returns a multer middleware function for handling single file uploads
 */
const uploadArrayOfFiles = (fieldName, uploadPath, type="image") => {
  return fileUpload(uploadPath, type).array(fieldName, 30);
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
 * @returns  {Function} Returns a multer middleware function for handling single file uploads
 */
const uploadFields = (fields, uploadPath, type="image") => {
  return fileUpload(uploadPath, type).fields(fields);
};
module.exports = {
  uploadSingleFile,
  uploadArrayOfFiles,
  uploadFields
}