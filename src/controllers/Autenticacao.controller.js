const model = require('../models/Autenticacao.model');

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

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