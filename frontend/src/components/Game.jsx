// /frontend/src/components/Game.jsx

import Square from "./Square"
import './Game.css'
import { useState, useEffect } from 'react';
import axios from 'axios';

// Função ajudante (sem mudanças)
function calculateWinner(squares) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (let [a, b, c] of lines) {
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}

// --- COMPONENTE PRINCIPAL DO JOGO ---
function Game() {

    // 1. URL do backend
    const API_URL = 'http://localhost:5000';

    // 2. States do Jogo
    const [gameHistory, setGameHistory] = useState([]);
    const [squares, setSquares] = useState(Array(9).fill(null));
    const [xIsNext, setXIsNext] = useState(true);

    // --- 🚀 NOVOS STATES PARA O MODAL 🚀 ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Guarda os dados do jogo que estamos criando ou editando
    const [modalData, setModalData] = useState(null); 
    // Guarda o texto do input "Nome"
    const [modalNameInput, setModalNameInput] = useState("");
    // Guarda o texto do input "Vencedor" (apenas para edição)
    const [modalWinnerInput, setModalWinnerInput] = useState("");
    // ------------------------------------

    // 3. Efeito para buscar o histórico no início
    useEffect(() => {
        fetchGameHistory();
    }, []);

    // --- FUNÇÕES DE API (CRUD) ---

    // READ
    const fetchGameHistory = async () => {
        try {
            const response = await axios.get(`${API_URL}/games`);
            setGameHistory(response.data);
        } catch (error) {
            console.error("Erro ao buscar histórico:", error);
        }
    };
    
    // DELETE
    const handleDeleteGame = async (gameId) => {
        if (window.confirm("Tem certeza que quer deletar esta partida?")) {
            try {
                await axios.delete(`${API_URL}/games/${gameId}`);
                fetchGameHistory();
            } catch (error) {
                console.error("Erro ao deletar o jogo:", error);
            }
        }
    };

    // --- LÓGICA DO JOGO ---

    const winner = calculateWinner(squares);
    const isDraw = !winner && !squares.includes(null);
    let status;

    if (winner) {
        status = "Vencedor " + winner;
    } else if (isDraw) {
        status = "Empate!"
    } else {
        status = "Próxima jogada: " + (xIsNext ? "X" : "O");
    }

    // --- FUNÇÃO DE CLIQUE (MODIFICADA PARA ABRIR O MODAL) ---
    function handleSquareClick(i) {
        if (squares[i] || winner) return;

        const nextSquares = [...squares];
        nextSquares[i] = xIsNext ? 'X' : 'O';
        setSquares(nextSquares);
        setXIsNext(!xIsNext);

        const newWinner = calculateWinner(nextSquares);
        const newIsDraw = !newWinner && !nextSquares.includes(null);

        if (newWinner) {
            // ANTES: saveGameResult(newWinner);
            // AGORA: Abre o modal para "CRIAR"
            openCreateModal(newWinner);
        } else if (newIsDraw) {
            // ANTES: saveGameResult('Empate');
            // AGORA: Abre o modal para "CRIAR"
            openCreateModal('Empate');
        }
    }

    // --- FUNÇÃO DE RESET ---
    function resetGame() {
        setSquares(Array(9).fill(null));
        setXIsNext(true);
    }
    
   

    // Abre o Modal para CRIAR um novo jogo
    function openCreateModal(winnerName) {
        setModalData({ winner: winnerName, type: 'create' });
        setModalNameInput(""); // Limpa o input
        setIsModalOpen(true); // Abre o modal
    }

    // Abre o Modal para EDITAR um jogo existente
    function openEditModal(game) {
        setModalData({ ...game, type: 'update' });
        setModalNameInput(game.name || ""); // Preenche o input com o nome atual
        setModalWinnerInput(game.winner); // Preenche o input com o vencedor atual
        setIsModalOpen(true); // Abre o modal
    }

    // Fecha o modal e limpa os dados
    function closeModal() {
        setIsModalOpen(false);
        setModalData(null);
        setModalNameInput("");
        setModalWinnerInput("");
    }

    // Função chamada ao clicar "Salvar" no Modal
    async function handleModalSubmit(event) {
        event.preventDefault(); // Impede o recarregamento da página

        if (!modalData) return;

        // Se for "update", chama a API de PUT
        if (modalData.type === 'update') {
            try {
                await axios.put(`${API_URL}/games/${modalData.id}`, { 
                    winner: modalWinnerInput, // Pega do input do modal
                    name: modalNameInput      // Pega do input do modal
                });
            } catch (error) {
                console.error("Erro ao atualizar o jogo:", error);
            }
        } 
        // Se for "create", chama a API de POST
        else if (modalData.type === 'create') {
            try {
                await axios.post(`${API_URL}/games`, { 
                    winner: modalData.winner, // Pega do jogo que acabou
                    name: modalNameInput || "Partida Anônima" // Pega do input
                });
            } catch (error) {
                console.error("Erro ao salvar o jogo:", error);
            }
        }

        closeModal(); // Fecha o modal
        fetchGameHistory(); // Atualiza a lista de jogos
    }

    // --- CÁLCULO DE PONTOS (PLACAR) ---
    const scores = gameHistory.reduce((acc, game) => {
        if (game.winner === 'X') {
            acc.X += 1;
        } else if (game.winner === 'O') {
            acc.O += 1;
        }
        return acc;
    }, { X: 0, O: 0 });

  
    return (
        <div className="game">
            <h1 className="title">Jogo da Velha</h1>

            <div className="scoreboard">
                <h3>Placar</h3>
                <div className="scores">
                    <span><strong>X:</strong> {scores.X} vitórias</span>
                    <span><strong>O:</strong> {scores.O} vitórias</span>
                </div>
            </div>

            <div className={winner || isDraw ? "status game-over" : "status"}>{status}</div>
            
            <div className="board">
                <div className="row">{[0, 1, 2].map((i) => <Square value={squares[i]} onClick={() => handleSquareClick(i)} key={i} />)}</div>
                <div className="row">{[3, 4, 5].map((i) => <Square value={squares[i]} onClick={() => handleSquareClick(i)} key={i} />)}</div>
                <div className="row">{[6, 7, 8].map((i) => <Square value={squares[i]} onClick={() => handleSquareClick(i)} key={i} />)}</div>
            </div>
            
            {(winner || isDraw) && <button className="reset" onClick={resetGame}>
                Novo Jogo
            </button>}

           
            <div className="game-history">
                <h3>Histórico de Partidas</h3>
                <ul>
                    {gameHistory.length === 0 && <p>Nenhum jogo salvo ainda.</p>}

                    {gameHistory.map((game) => (
                        <li key={game.id}>
                            <span>
                                <strong>{game.name || "Partida"}</strong> (Vencedor: {game.winner})
                            </span>
                            
                            <div>
                                <button
                                    className="edit-button"
                                    onClick={() => openEditModal(game)}
                                >
                                    Editar
                                </button>
                                <button
                                    className="delete-button"
                                    onClick={() => handleDeleteGame(game.id)}
                                >
                                    X
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

    
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        
                        <h3>
                            {modalData.type === 'create' 
                                ? 'Salvar Partida' 
                                : 'Editar Partida'}
                        </h3>
                        
                        <form onSubmit={handleModalSubmit}>
                            {/* Mostra o vencedor (se for criação) ou um input (se for edição) */}
                            {modalData.type === 'create' ? (
                                <p>Vencedor: <strong>{modalData.winner}</strong></p>
                            ) : (
                                <div className="form-group">
                                    <label htmlFor="winnerInput">Vencedor:</label>
                                    <input 
                                        id="winnerInput"
                                        type="text"
                                        value={modalWinnerInput}
                                        onChange={(e) => setModalWinnerInput(e.target.value)}
                                    />
                                </div>
                            )}

                            {/* Input para o NOME (em ambos os casos) */}
                            <div className="form-group">
                                <label htmlFor="nameInput">Nome da Partida:</label>
                                <input
                                    id="nameInput"
                                    type="text"
                                    value={modalNameInput}
                                    onChange={(e) => setModalNameInput(e.target.value)}
                                    placeholder="Ex: Amanda vs. Bot"
                                    autoFocus 
                                />
                            </div>

                            <div className="modal-buttons">
                                <button type="button" className="modal-btn-cancel" onClick={closeModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="modal-btn-save">
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
         

        </div>
    )
}


export default Game
