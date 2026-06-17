const express = require('express');
const controller = require('../controllers/Autenticacao.controller');
const router = express.Router();

router.post('/login', controller.login);

module.exports = router;