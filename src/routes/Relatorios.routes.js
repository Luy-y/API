const express = require('express');
const router = express.Router();

const controller = require('../controllers/Relatorios.controller');

router.post('/gerar', controller.gerar);
router.post('/exportar', controller.exportar);
router.get('/arquivo/:nome', controller.baixar);

/* 🔥 ESSA ROTA */
router.get('/ocupacao-hoje', controller.ocupacaoHoje);

module.exports = router;