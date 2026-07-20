const express = require('express');
const controller = require('../controllers/Turmas.controller');

const router = express.Router();

const { verificarAdmin } = require('../middlewares/auth');
const { validarId } = require('../middlewares/validarId');

router.get('/', controller.listar);
router.get('/:id', validarId, controller.buscarPorId);

router.post('/', verificarAdmin, controller.criar);
router.put('/:id', verificarAdmin, validarId, controller.atualizar);
router.delete('/:id', verificarAdmin, validarId, controller.deletar);

module.exports = router;