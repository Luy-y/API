const express = require('express');
const router = express.Router();

const controller = require('../controllers/Relatorios.controller');

router.post('/gerar', controller.gerar);
router.post('/exportar', controller.exportar);
router.get('/arquivo/:nome', controller.baixar);

console.log(
    JSON.stringify(registros[0], null, 2)
);

router.get('/ocupacao-hoje', controller.ocupacaoHoje);

module.exports = router;