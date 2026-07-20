const express = require('express');
const controller = require('../controllers/Autenticacao.controller');
const { limiteLogin } = require('../middlewares/limiteLogin');
const router = express.Router();

router.post('/login', limiteLogin, controller.login);

module.exports = router;