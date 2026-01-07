const express = require('express');
const userControllers = require('./../controllers/userController');

const router = express.Router();

router.param('id', (req, res, next, val) => {
  console.log(`User id is: ${val}`);
  next();
});

router
  .route('/')
  .get(userControllers.getAllUsers)
  .post(userControllers.createUser);

router
  .route('/:id')
  .get(userControllers.getUser)
  .patch(userControllers.updateUser)
  .delete(userControllers.deleteUser);

module.exports = router;
