import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  upload,
  uploadDocument,
  getMyDocuments,
  getTenantDocuments,
  deleteDocument
} from '../controllers/documentController.js';

const router = express.Router();

// Tenant routes
router.post('/upload', protect, authorize('tenant'), upload.single('document'), uploadDocument);
router.get('/my-documents', protect, authorize('tenant'), getMyDocuments);
router.delete('/:docId', protect, authorize('tenant'), deleteDocument);

// Landlord routes
router.get('/tenant/:tenantId', protect, authorize('landlord'), getTenantDocuments);

export default router;