import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getMaintenanceRequests,
  getMaintenanceRequest,
  createMaintenanceRequest,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
  updateMaintenanceStatus
} from '../controllers/maintenanceController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all maintenance requests & Create request
router.route('/')
  .get(getMaintenanceRequests)
  .post(createMaintenanceRequest);

// Single maintenance request operations
router.route('/:id')
  .get(getMaintenanceRequest)
  .put(updateMaintenanceRequest)
  .delete(authorize('landlord'), deleteMaintenanceRequest);

// Update status
router.put('/:id/status', authorize('landlord'), updateMaintenanceStatus);

export default router;