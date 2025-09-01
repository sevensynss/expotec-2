const express = require('express');
const mysql = require('mysql2'); // Importa o conector
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const port = 4000;

// Configuração da conexão com o banco de dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.db_password,
    database: 'bd_expotec'
});

db.connect((err) => {
    if (err) {
        console.error('Erro na conexão com o banco de dados:', err.stack);
        return;
    }
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
});

// Middleware para CORS
app.use(cors());
// Middleware para entender JSON
app.use(express.json());

// Rota para buscar dados de usuários do banco de dados
app.get('/api/usuarios', (req, res) => {
    const query = 'SELECT nome, idade, cidade FROM usuarios';

    // Executa a consulta no banco de dados
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro na consulta:', err);
            res.status(500).json({ error: 'Erro ao buscar dados dos usuários.' });
            return;
        }

        // Envia os resultados como JSON
        res.json(results);
    });
});

app.post('/api/registrar', (req, res) => {
    const { nome, data_nasc, email, senha, usuario, cpf } = req.body;

    if (!nome || !data_nasc || !email || !senha || !usuario || !cpf) {
        return res.status(400).json({ mensagem: 'Preencha todos os campos.' });
    }

    // Verifica se o e-mail já existe
    db.query('SELECT email FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Erro ao verificar e-mail:', err);
            return res.status(500).json({ mensagem: 'Erro ao registrar usuário.' });
        }
        if (results.length > 0) {
            return res.status(409).json({ mensagem: 'Este e-mail já está em uso.' });
        }

        // Criptografa a senha antes de salvar
        bcrypt.hash(senha, 10, (err, senhaHash) => {
            if (err) {
                console.error('Erro ao criptografar senha:', err);
                return res.status(500).json({ mensagem: 'Erro ao registrar usuário.' });
            }
            const query = 'INSERT INTO usuarios (nome, data_nasc, email, senha, usuario, cpf) VALUES (?, ?, ?, ?, ?, ?)';
            const values = [nome, data_nasc, email, senhaHash, usuario, cpf];
            db.query(query, values, (err, result) => {
                if (err) {
                    console.error('Erro ao registrar usuário:', err);
                    return res.status(500).json({ mensagem: 'Erro ao registrar usuário.' });
                }
                res.json({ mensagem: 'Registro realizado com sucesso!' });
            });
        });
    });
});

app.post('/api/login', (req, res) => {
    // validação usuário/senha (tenho que fazer)
    res.json({ mensagem: 'Login realizado com sucesso!' });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
