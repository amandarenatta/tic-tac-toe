// /backend/index.js
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client'; // 1. Importe o Prisma

// 2. Crie a instância do cliente
const prisma = new PrismaClient();
const app = express();
const PORT = 5000; // Porta do backend

// Middlewares
app.use(express.json()); // Permite ao servidor entender JSON
app.use(cors()); // Permite que o frontend acesse o backend

// --- OPERAÇÕES CRUD (REQUISITO 3) ---

// CREATE (Inclusão): Salvar um novo resultado de jogo
app.post('/games', async (req, res) => {
  try {
    const { winner, name } = req.body; // <-- ATUALIZADO
    const newGame = await prisma.gameResult.create({
      data: {
        winner: winner,
        name: name, // <-- ATUALIZADO
      },
    });
    // Retorna o novo jogo que foi criado no banco
    res.status(201).json(newGame);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao salvar o jogo' });
  }
});

// READ (Acesso): Obter todos os resultados
app.get('/games', async (req, res) => {
  try {
    const games = await prisma.gameResult.findMany({
      orderBy: {
        createdAt: 'desc', // Mostra os mais recentes primeiro
      },
    });
    res.json(games);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar jogos' });
  }
});

// UPDATE (Alteração): Atualizar um resultado de jogo
app.put('/games/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { winner, name } = req.body; // <-- ATUALIZADO

    const updatedGame = await prisma.gameResult.update({
      where: {
        id: parseInt(id),
      },
      data: {
        winner: winner, // <-- ATUALIZADO
        name: name,     // <-- ATUALIZADO
      },
    });
    res.json(updatedGame); // Retorna o jogo atualizado
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar o jogo' });
  }
});


// DELETE (Exclusão): Deletar um resultado
app.delete('/games/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.gameResult.delete({
      where: {
        id: parseInt(id), // Converte o ID da URL (texto) para número
      },
    });
    res.json({ message: 'Jogo deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar jogo' });
  }
});

// -------------------------------------

// Rota de Teste
app.get('/', (req, res) => {
  res.send('Servidor do Jogo da Velha está rodando e conectado ao Prisma!');
});

// Inicia o Servidor
app.listen(PORT, () => {
  console.log(`Servidor backend rodando em http://localhost:${PORT}`);
});