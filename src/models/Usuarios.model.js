const db = require('../config/db');

// LISTAR
exports.buscarTodos = async () => {
    const [rows] = await db.promise().query(
        'SELECT id, nome, email, telefone, tipo FROM Usuarios'
    );
    return rows;
};

// BUSCAR
exports.buscarPorId = async (id) => {
    const [rows] = await db.promise().query(
        'SELECT id, nome, email, telefone, tipo FROM Usuarios WHERE id = ?',
        [id]
    );
    return rows[0];
};

// CRIAR
exports.criar = async ({ nome, email, telefone, tipo, senha }) => {

    const [result] = await db.promise().query(
        `INSERT INTO Usuarios (nome, email, telefone, tipo, senha)
         VALUES (?, ?, ?, ?, ?)`,
        [nome, email, telefone, tipo, senha]
    );

    return result.insertId;
};

// UPDATE DINÂMICO (PADRÃO DO SISTEMA)
exports.atualizar = async (id, dados) => {

    const campos = [];
    const valores = [];

    for (let chave in dados) {
        if (dados[chave] !== undefined) {
            campos.push(`${chave} = ?`);
            valores.push(dados[chave]);
        }
    }

    if (campos.length === 0) return;

    valores.push(id);

    await db.promise().query(
        `UPDATE Usuarios SET ${campos.join(', ')} WHERE id = ?`,
        valores
    );
};

// DELETAR
exports.deletar = async (id) => {
    await db.promise().query(
        'DELETE FROM Usuarios WHERE id = ?',
        [id]
    );
};