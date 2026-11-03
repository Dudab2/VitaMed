const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const fs = require('fs');

const conexao = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    ssl: process.env.DB_SSL === 'true'
        ? {
            ca: fs.readFileSync(__dirname + '/ca.pem')
        }
        : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
function autenticarToken(req, res, next) {
    const autorizacao = req.headers['authorization'];

    if (!autorizacao) {
        return res.status(401).json({
            mensagem: 'Token de autenticação não informado.'
        });
    }

    const partes = autorizacao.split(' ');
    const esquema = partes[0];
    const token = partes[1];

    if (esquema !== 'Bearer' || !token) {
        return res.status(401).json({
            mensagem: 'Formato do token inválido.'
        });
    }

    try {
        const dados = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.usuario = {
            id: dados.id,
            role: dados.role
        };

        next();

    } catch (erro) {
        return res.status(401).json({
            mensagem: 'Token inválido ou expirado.'
        });
    }
}

app.get('/', (req, res) => {
    res.send('Servidor VitaMed funcionando!');
});

app.get('/teste-banco', async (req, res) => {
    try {
        const [resultado] = await conexao.query(
            'SELECT DATABASE() AS banco'
        );

        res.json({
            mensagem: 'Conexão com MySQL realizada com sucesso!',
            banco: resultado[0].banco
        });

    } catch (erro) {
        console.error('Erro ao conectar:', erro.message);

        res.status(500).json({
            mensagem: 'Não foi possível conectar ao banco de dados.'
        });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, senha, tipo_usuario } = req.body;

        if (!email || !senha || !tipo_usuario) {
            return res.status(400).json({
                mensagem: 'Preencha todos os campos.'
            });
        }

        const [usuarios] = await conexao.execute(
            `SELECT id, nome, email, senha_hash, tipo_usuario
             FROM usuarios
             WHERE email = ? AND tipo_usuario = ?`,
            [email, tipo_usuario]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                mensagem: 'E-mail, senha ou perfil incorreto.'
            });
        }

        const usuario = usuarios[0];

        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.senha_hash
        );

        if (!senhaCorreta) {
            return res.status(401).json({
                mensagem: 'E-mail, senha ou perfil incorreto.'
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET não configurado.');
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                role: usuario.tipo_usuario
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '8h'
            }
        );

        return res.json({
            mensagem: 'Login realizado com sucesso!',
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo_usuario: usuario.tipo_usuario
            }
        });

    } catch (erro) {
        console.error('Erro no login:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao realizar login.'
        });
    }
});

app.post('/cadastro', async (req, res) => {
    try {
        const { nome, email, senha, tipo_usuario } = req.body;


        if (!nome || !email || !senha || !tipo_usuario) {
            return res.status(400).json({
                mensagem: 'Preencha todos os campos.'
            });
        }

        if (!['idoso', 'cuidador'].includes(tipo_usuario)) {
            return res.status(400).json({
                mensagem: 'Tipo de usuário inválido.'
            });
        }

        if (senha.length < 8) {
            return res.status(400).json({
                mensagem: 'A senha deve ter pelo menos 8 caracteres.'
            });
        }


        const [usuarios] = await conexao.execute(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (usuarios.length > 0) {
            return res.status(409).json({
                mensagem: 'Este e-mail já está cadastrado.'
            });
        }


        const senhaHash = await bcrypt.hash(senha, 10);


        const [resultado] = await conexao.execute(
            `INSERT INTO usuarios
            (nome, email, senha_hash, tipo_usuario)
            VALUES (?, ?, ?, ?)`,
            [nome, email, senhaHash, tipo_usuario]
        );


        if (tipo_usuario === 'idoso') {
            await conexao.execute(
                'INSERT INTO idosos (usuario_id) VALUES (?)',
                [resultado.insertId]
            );
        } else {
            await conexao.execute(
                'INSERT INTO cuidadores (usuario_id) VALUES (?)',
                [resultado.insertId]
            );
        }

        return res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso!',
            usuarioId: resultado.insertId
        });

    } catch (erro) {
        console.error('Erro no cadastro:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao cadastrar usuário.'
        });
    }
});



app.post('/medicamentos', autenticarToken, async (req, res) => {
    try {
        const {
            nome,
            dosagem,
            instrucoes,
            quantidade_estoque,
            estoque_minimo
        } = req.body;

        const usuario_id = req.usuario.id;

        if (!usuario_id || !nome || !dosagem) {
            return res.status(400).json({
                mensagem: 'Informe o usuário, o nome e a dosagem do medicamento.'
            });
        }


        const [usuarios] = await conexao.execute(
            'SELECT id FROM usuarios WHERE id = ?',
            [usuario_id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                mensagem: 'Usuário não encontrado.'
            });
        }


        const [resultado] = await conexao.execute(
            `INSERT INTO medicamentos
            (usuario_id, nome, dosagem, instrucoes, quantidade_estoque, estoque_minimo)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                usuario_id,
                nome,
                dosagem,
                instrucoes || null,
                quantidade_estoque ?? 0,
                estoque_minimo ?? 0
            ]
        );

        return res.status(201).json({
            mensagem: 'Medicamento cadastrado com sucesso!',
            medicamentoId: resultado.insertId
        });

    } catch (erro) {
        console.error('Erro ao cadastrar medicamento:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao cadastrar medicamento.'
        });
    }
});

app.post('/vinculos/solicitar', autenticarToken, async (req, res) => {
    try {
        if (req.usuario.role !== 'cuidador') {
            return res.status(403).json({
                mensagem: 'Somente cuidadores podem solicitar vínculos.'
            });
        }

        const { email_idoso } = req.body;

        if (!email_idoso) {
            return res.status(400).json({
                mensagem: 'Informe o e-mail do idoso.'
            });
        }

        const [idososEncontrados] = await conexao.execute(
            `SELECT u.id
             FROM usuarios u
             INNER JOIN idosos i ON i.usuario_id = u.id
             WHERE u.email = ? AND u.tipo_usuario = 'idoso'`,
            [email_idoso]
        );

        if (idososEncontrados.length === 0) {
            return res.status(404).json({
                mensagem: 'Nenhum idoso encontrado com esse e-mail.'
            });
        }

        const idosoId = idososEncontrados[0].id;
        const cuidadorId = req.usuario.id;

        const [vinculosExistentes] = await conexao.execute(
            `SELECT id, aprovado
             FROM vinculo_cuidador
             WHERE idoso_usuario_id = ?
             AND cuidador_usuario_id = ?`,
            [idosoId, cuidadorId]
        );

        if (vinculosExistentes.length > 0) {
            return res.status(409).json({
                mensagem: 'Já existe uma solicitação ou vínculo entre essas contas.'
            });
        }

        await conexao.execute(
            `INSERT INTO vinculo_cuidador
             (idoso_usuario_id, cuidador_usuario_id, aprovado)
             VALUES (?, ?, 0)`,
            [idosoId, cuidadorId]
        );

        return res.status(201).json({
            mensagem: 'Solicitação de vínculo enviada com sucesso!'
        });

    } catch (erro) {
        console.error('Erro ao solicitar vínculo:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao enviar solicitação de vínculo.'
        });
    }
});

app.get('/vinculos/pendentes', autenticarToken, async (req, res) => {
    try {
        if (req.usuario.role !== 'idoso') {
            return res.status(403).json({
                mensagem: 'Somente idosos podem consultar solicitações recebidas.'
            });
        }

        const [solicitacoes] = await conexao.execute(
            `SELECT
                vc.id,
                vc.cuidador_usuario_id,
                u.nome AS nome_cuidador,
                u.email AS email_cuidador,
                vc.data_vinculo
             FROM vinculo_cuidador vc
             INNER JOIN usuarios u
                ON u.id = vc.cuidador_usuario_id
             WHERE vc.idoso_usuario_id = ?
             AND vc.aprovado = 0
             ORDER BY vc.data_vinculo DESC`,
            [req.usuario.id]
        );

        return res.json(solicitacoes);

    } catch (erro) {
        console.error('Erro ao consultar solicitações:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao consultar solicitações pendentes.'
        });
    }
});

app.patch('/vinculos/:id/responder', autenticarToken, async (req, res) => {
    try {
        if (req.usuario.role !== 'idoso') {
            return res.status(403).json({
                mensagem: 'Somente idosos podem responder às solicitações.'
            });
        }

        const vinculoId = Number(req.params.id);
        const { aprovado } = req.body;

        if (!Number.isInteger(vinculoId) || vinculoId <= 0) {
            return res.status(400).json({
                mensagem: 'Solicitação inválida.'
            });
        }

        if (typeof aprovado !== 'boolean') {
            return res.status(400).json({
                mensagem: 'Informe se deseja aceitar ou recusar a solicitação.'
            });
        }

        const [resultado] = await conexao.execute(
            `UPDATE vinculo_cuidador
             SET aprovado = ?
             WHERE id = ?
             AND idoso_usuario_id = ?
             AND aprovado = 0`,
            [aprovado ? 1 : 2, vinculoId, req.usuario.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: 'Solicitação não encontrada ou já respondida.'
            });
        }

        return res.json({
            mensagem: aprovado
                ? 'Solicitação aprovada com sucesso!'
                : 'Solicitação recusada com sucesso!'
        });

    } catch (erro) {
        console.error('Erro ao responder solicitação:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao responder à solicitação.'
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`VitaMed rodando em http://localhost:${PORT}`);
});
