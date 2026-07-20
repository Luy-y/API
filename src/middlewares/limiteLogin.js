/**
 * Limitador simples de tentativas de login, guardado em memória
 * (nenhuma biblioteca nova — só um Map do JavaScript puro).
 *
 * Motivo: hoje não existe nenhum limite de tentativas no /autenticacao/login,
 * o que permite tentar senhas indefinidamente (força bruta). Como a regra de
 * senha do sistema é fixa em 6 caracteres, isso piora o risco.
 *
 * Como funciona: cada IP tem um contador de tentativas dentro de uma janela
 * de tempo. Ao estourar o limite, a API responde 429 até a janela expirar.
 * Não distingue tentativa certa/errada de propósito — é mais simples e já
 * reduz bastante a velocidade de um ataque automatizado.
 *
 * Limitações conhecidas (aceitáveis para o momento):
 * - Guardado em memória do processo: se a API reiniciar, os contadores
 *   zeram. Em ambientes com múltiplas instâncias rodando ao mesmo tempo,
 *   cada instância teria seu próprio contador (não é compartilhado).
 * - Identifica por IP; usuários atrás do mesmo IP/proxy compartilham o
 *   mesmo contador. Isso normalmente não é um problema para o volume de
 *   uso esperado do sistema.
 */

const JANELA_MS = 15 * 60 * 1000; // 15 minutos
const LIMITE_TENTATIVAS = 15;     // por IP, dentro da janela

const tentativasPorIp = new Map();

function limparExpirados(agora) {
    for (const [ip, dados] of tentativasPorIp) {
        if (agora > dados.expiraEm) {
            tentativasPorIp.delete(ip);
        }
    }
}

function limiteLogin(req, res, next) {
    const ip = req.ip || req.socket?.remoteAddress || 'desconhecido';
    const agora = Date.now();

    limparExpirados(agora);

    const registro = tentativasPorIp.get(ip);

    if (!registro) {
        tentativasPorIp.set(ip, { tentativas: 1, expiraEm: agora + JANELA_MS });
        return next();
    }

    if (registro.tentativas >= LIMITE_TENTATIVAS) {
        return res.status(429).json({
            erro: 'Muitas tentativas de login. Tente novamente em alguns minutos.'
        });
    }

    registro.tentativas += 1;
    next();
}

module.exports = { limiteLogin };
