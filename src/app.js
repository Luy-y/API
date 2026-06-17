const express = require('express');
const cors = require('cors');
require('dotenv').config();

const usuariosRoutes = require('./routes/Usuarios.routes');
const turmasRoutes = require('./routes/Turmas.routes');
const ambientesRoutes = require('./routes/Ambientes.routes');
const registrosRoutes = require('./routes/Registros.routes');
const autenticacaoRoutes = require('./routes/Autenticacao.routes');
const relatoriosRoutes = require('./routes/Relatorios.routes');
const instrutoresRoutes = require('./routes/Instrutores.routes');

const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

// Padronização: rotas em minúsculo
app.use('/usuarios', usuariosRoutes);
app.use('/turmas', turmasRoutes);
app.use('/ambientes', ambientesRoutes);
app.use('/registros', registrosRoutes);
app.use('/autenticacao', autenticacaoRoutes);
app.use('/relatorios', relatoriosRoutes);
app.use('/instrutores', instrutoresRoutes);

// Middleware de erro sempre por último
app.use(errorMiddleware);

module.exports = app;