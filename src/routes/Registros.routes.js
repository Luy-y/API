const express = require('express');
const controller = require('../controllers/Registros.controller'); // ✅ CORRIGIDO

const router = express.Router();

router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);

const { verificarAdmin } = require('../middlewares/auth');

router.post('/', verificarAdmin, controller.criar);
router.put('/:id', verificarAdmin, controller.atualizar);
router.delete('/:id', verificarAdmin, controller.deletar);

module.exports = router;