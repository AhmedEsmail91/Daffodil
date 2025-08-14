const express = require("express");
const validation = require("../../middlewares/validation");
// const authMiddleware = require("../../middlewares/auth");

const userController = require('./user.controller');
const userVal = require('./user.validation');

const userRouter = express.Router();

/**
 * Route: /
 * Description: Create a new user or get all users
 * Methods: POST, GET
 */
userRouter.route('/')
    .post(
        //authMiddleware.Authenticate, // Authenticate the user
        validation(userVal.createUserSchemaVal), // Validate request body
        userController.addUser // Controller to handle user creation
    )
    .get(
        //authMiddleware.Authenticate, // Authenticate the user
        userController.getAllUsers // Controller to fetch all users
    );

/**
 * Route: /:id
 * Description: Get, update, or delete a user by ID
 * Methods: GET, PUT, DELETE
 */
userRouter.route('/:id')
    .get(
        //authMiddleware.Authenticate, // Authenticate the user
        validation(userVal.paramIdSchemaVal), // Validate ID parameter
        userController.getSingleUser // Controller to fetch a single user
    )
    .put(
        //authMiddleware.Authenticate, // Authenticate the user
        validation(userVal.updateUserSchemaVal), // Validate request body
        userController.updateUser // Controller to update user details
    )
    .delete(
        //authMiddleware.Authenticate, // Authenticate the user
        validation(userVal.paramIdSchemaVal), // Validate ID parameter
        userController.deleteUser // Controller to delete a user
    );

module.exports = userRouter;