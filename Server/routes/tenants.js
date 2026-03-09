import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getTenants,
  getTenant,
  createTenant,
  updateTenant,
  deleteTenant,
  markAsPastTenant,
  getMyTenants
} from '../controllers/tenantController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all tenants & Create tenant
router.route('/')
  .get(getTenants)
  .post(authorize('landlord'), createTenant);

router.get('/my-tenants', authorize('agent'), getMyTenants);

// Single tenant operations
router.route('/:id')
  .get(getTenant)
  .put(authorize('landlord'), updateTenant)
  .delete(authorize('landlord'), deleteTenant);

// Mark tenant as past
router.put('/:id/mark-past', authorize('landlord'), markAsPastTenant);

export default router;