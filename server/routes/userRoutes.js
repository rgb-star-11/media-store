const express = require('express');
const router = express.Router();
const { getAllUsers, changeUserPassword, deleteUser } = require('../controllers/userController'); // اضافه شدن deleteUser
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.use(requireAuth, requireAdmin);
router.get('/', getAllUsers);
router.put('/:id/password', changeUserPassword);
router.delete('/:id', deleteUser);

module.exports = router;
