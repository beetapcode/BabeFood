const authControllers = require('../controllers/authControllers');
const middlewareController = require('../controllers/middlewareController');

const router = require('express').Router();

//register
router.post('/register', authControllers.registerUser);

//login
router.post('/login', authControllers.loginUser);

//login with facebook
router.post('/login-facebook', authControllers.loginWithFacebook);

//refresh token
router.post('/refresh', authControllers.requestRefreshToken);

//logout
router.post('/logout', middlewareController.verifyToken, authControllers.userLogout);

//update user
router.put('/update/:id', authControllers.updateUser);

module.exports = router;
