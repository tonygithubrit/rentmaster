import express from "express";
import { protect } from "../middleware/auth.js";
const router = express.Router();


// Placeholder - to be implemented
router.get('/', protect, (req, res) => {
  res.json({ status: 'success', message: 'Leads endpoint - Coming soon' });
});

export default router;