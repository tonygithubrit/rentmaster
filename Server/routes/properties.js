import express from "express";
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  archiveProperty,
  restoreProperty,
  deleteProperty,
  validateAccessCode
} from "../controllers/propertyController.js";
import { protect, authorize } from "../middleware/auth.js";
const router = express.Router();


// Public routes
router.post('/validate-access-code', validateAccessCode);

// Protected routes - all authenticated users can view
router.get('/', protect, getProperties);
router.get('/:id', protect, getProperty);

// Landlord-only routes
router.post('/', protect, authorize('landlord'), createProperty);
router.put('/:id', protect, authorize('landlord'), updateProperty);
router.put('/:id/archive', protect, authorize('landlord'), archiveProperty);
router.put('/:id/restore', protect, authorize('landlord'), restoreProperty);
router.delete('/:id', protect, authorize('landlord'), deleteProperty);

export default router;
