const express = require('express');
const userController = require('../controllers/user.controller');
const router = express.Router();

// obtiene los usuarios existentes
router.get("/api/users", userController.getUsers)

// agrega un nuevo usuario
router.post("/api/users", userController.newUser)

// actualiza los roles de un usuario 
router.put("/api/users/:userId", userController.updateUserRoles)

// elimina un usuario
router.delete("/api/users/:userId", userController.deleteUser)

module.exports = router;