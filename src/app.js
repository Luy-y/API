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

// 🔒 Remove o header "X-Powered-By: Express", que entrega qual framework/
// tecnologia roda por trás da API sem necessidade nenhuma. Não usa
// biblioteca nenhuma, é uma configuração nativa do Express.
app.disable('x-powered-by');

// 🔒 Headers básicos de segurança, escritos à mão (sem depender do Helmet,
// que não está no package.json e a ideia é não adicionar dependências
// novas). Cada um previne uma classe simples e conhecida de ataque:
app.use((req, res, next) => {
    // Impede que o navegador tente "adivinhar" o tipo de um arquivo
    // diferente do Content-Type declarado (mitiga alguns ataques de MIME
    // sniffing).
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Como essa API só serve JSON (nunca HTML), não há motivo pra ela
    // poder ser carregada dentro de um <iframe> em outro site — evita
    // clickjacking.
    res.setHeader('X-Frame-Options', 'DENY');

    // Evita vazar a URL completa de origem (incluindo querystring) para
    // outros sites quando o navegador segue links/recursos externos.
    res.setHeader('Referrer-Policy', 'no-referrer');

    // Reduz a superfície de "recursos" que o navegador tentaria negociar
    // automaticamente (câmera, geolocalização, etc.) para uma API que não
    // usa nenhum deles.
    res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');

    next();
});

app.use(cors());

// 🔒 Limita o tamanho do corpo JSON aceito em qualquer requisição. Sem
// isso, o valor padrão do Express já é 100kb, mas deixamos explícito
// (e um pouco generoso) para documentar a intenção e evitar que alguém
// aumente sem perceber o impacto. Nenhum payload legítimo do sistema
// (formulários de cadastro, filtros de relatório) chega perto disso.
app.use(express.json({ limit: '100kb' }));

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