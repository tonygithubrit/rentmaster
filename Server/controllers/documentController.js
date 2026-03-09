import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Tenant from '../models/Tenant.js';

// ========== MULTER STORAGE CONFIG ==========
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = `uploads/tenants/${req.user._id}`;
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and image files are allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ========== UPLOAD DOCUMENT ==========
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    const { documentName, documentType } = req.body;
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/tenants/${req.user._id}/${req.file.filename}`;

    // Find tenant record
    const tenant = await Tenant.findOne({ userId: req.user._id });
    if (!tenant) {
      return res.status(404).json({ status: 'error', message: 'Tenant record not found' });
    }

    // Add document to tenant's documents array
    const doc = {
      name: documentName || req.file.originalname,
      documentType: documentType || 'Other',
      url: fileUrl,
      filename: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date()
    };

    tenant.documents.push(doc);
    await tenant.save();

    res.status(201).json({
      status: 'success',
      message: 'Document uploaded successfully',
      data: { document: tenant.documents[tenant.documents.length - 1] }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ========== GET MY DOCUMENTS ==========
export const getMyDocuments = async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ userId: req.user._id }).select('documents name propertyName');
    if (!tenant) {
      return res.status(404).json({ status: 'error', message: 'Tenant record not found' });
    }

    res.json({
      status: 'success',
      data: {
        documents: tenant.documents,
        tenantName: tenant.name,
        propertyName: tenant.propertyName
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ========== GET TENANT DOCUMENTS (Landlord) ==========
export const getTenantDocuments = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.tenantId)
      .select('documents name propertyName landlordId');

    if (!tenant) {
      return res.status(404).json({ status: 'error', message: 'Tenant not found' });
    }

    // Make sure landlord owns this tenant
    if (tenant.landlordId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'error', message: 'Not authorized' });
    }

    res.json({
      status: 'success',
      data: { documents: tenant.documents, tenantName: tenant.name }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ========== DELETE DOCUMENT ==========
export const deleteDocument = async (req, res) => {
  try {
    const { docId } = req.params;

    const tenant = await Tenant.findOne({ userId: req.user._id });
    if (!tenant) {
      return res.status(404).json({ status: 'error', message: 'Tenant record not found' });
    }

    const doc = tenant.documents.id(docId);
    if (!doc) {
      return res.status(404).json({ status: 'error', message: 'Document not found' });
    }

    // Delete file from disk
    const filePath = `uploads/tenants/${req.user._id}/${doc.filename}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from DB
    tenant.documents.pull(docId);
    await tenant.save();

    res.json({ status: 'success', message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};