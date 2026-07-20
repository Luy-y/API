const model = require('../models/Autenticacao.model');

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 🔒 Garante que email/senha vieram como texto antes de consultar o
        // banco. Não muda nada pra quem já usa a tela de login normalmente
        // (que sempre manda string) — só barra valores malformados
        // (ex: objetos, arrays) que o front nunca deveria mandar mesmo.
        if (
            typeof email !== 'string' || !email.trim() ||
            typeof password !== 'string' || !password
        ) {
            return res.status(400).json({
                success: false,
                message: 'E-mail e senha são obrigatórios.'
            });
        }

        const usuario = await model.buscarPorEmail(email);

        if (usuario && usuario.senha === password) {

            res.json({
                success: true,
                message: 'Login realizado com sucesso!',
                user: {
                    id: usuario.id,
                    email: usuario.email,
                    tipo: usuario.tipo   
                }
            });

        } else {
            res.status(401).json({
                success: false,  
                message: 'E-mail ou senha inválidos.'
            });
        }

    } catch (err) {
        next(err);
    }
};