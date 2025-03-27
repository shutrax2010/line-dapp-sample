import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import liff from "@line/liff";
import { getContractDetail, getBalance,getKaiaPrice, mintTokens } from './services/apiService';


// ゲームで使用するカードデータ
const cards = [
  { id: 1, value: '🍎' },
  { id: 2, value: '🍎' },
  { id: 3, value: '🍌' },
  { id: 4, value: '🍌' },
  { id: 5, value: '🍉' },
  { id: 6, value: '🍉' },
  { id: 7, value: '🍓' },
  { id: 8, value: '🍓' },
  { id: 9, value: '🍍' },
  { id: 10, value: '🍍' },
];

const App = () => {
  const [flippedCards, setFlippedCards] = useState([]); // 裏返したカードの状態
  const [matchedCards, setMatchedCards] = useState([]); // 一致したカード
  const [gameStarted, setGameStarted] = useState(false); // ゲーム開始フラグ
  const [score, setScore] = useState(0); // スコア
  const [turns, setTurns] = useState(0); // ターン数
  const [gameOver, setGameOver] = useState(false); // ゲーム終了フラグ
  const [shuffledCards, setShuffledCards] = useState([]); // シャッフルされたカードの状態
  const [name, setName] = useState("");
  const [balance, setBalance] = useState('0');
  const [mintAmount, setMintAmount] = useState('');
  const [mintTransaction, setMintTransaction] = useState('');


  const address = import.meta.env.VITE_KAIA_ADDRESS;
  const exurl = 'https://kairos.kaiascan.io/address/' + address;
  const isDesktop = useMediaQuery({ query: '(min-width: 768px)' });

  // YTTの残高を取得
  const handleGetBalance = async () => {
    const balanceData = await getBalance(address);
    setBalance(balanceData.balance);
  };

  // YTTトークンを発行
  const handleMint = async (mintAmount) => {
    const mintResult = await mintTokens(address, mintAmount);
    setMintTransaction(mintResult.transactionHash);
  };

  // カードのシャッフル処理
  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
  };

  // ゲーム開始処理
  const startGame = () => {
    setScore(0);
    setTurns(0);
    setMatchedCards([]);
    setFlippedCards([]);
    setGameOver(false);
    setGameStarted(true);  
    shuffleCards(); // ゲーム開始時にのみシャッフル
  };

  // カードをクリックしたときの処理
  const handleCardClick = (index) => {
    if (flippedCards.length === 2 || flippedCards.includes(index) || matchedCards.includes(shuffledCards[index].value) || gameOver) return;

    setFlippedCards((prev) => [...prev, index]);

    // 2枚目のカードが選ばれたときに一致チェック
    if (flippedCards.length === 1) {
      const firstCard = shuffledCards[flippedCards[0]];
      const secondCard = shuffledCards[index];

      // 一致した場合、カードをそのまま残しスコアを増加
      if (firstCard.value === secondCard.value) {
        setMatchedCards((prev) => [...prev, firstCard.value, secondCard.value]);

        // ターン数に応じてスコアをボーナス計算
        let bonusScore = 0;
        if (turns === 0) {
          bonusScore = 30; // 最初のターン
        } else if (turns === 1) {
          bonusScore = 20; // 2ターン目
        } else if (turns === 2) {
          bonusScore = 10; // 3ターン目
        }

        setScore((prevScore) => prevScore + 10 + bonusScore); // 基本スコア + ボーナス
        setFlippedCards([]);
        setTurns((prev) => prev + 1);
      } else {
        // 一致しなかった場合、裏返すまで待つ
        setTimeout(() => {
          setFlippedCards([]);
          setTurns((prev) => prev + 1);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    liff
    .init({
      liffId: import.meta.env.VITE_LIFF_ID
    })
    .then(() => {
      liff.getProfile()
        .then((profile) => {
          setName(profile.displayName);
        })
    })

    handleGetBalance();

    if (matchedCards.length === cards.length) {
      setGameOver(true);
      handleMint('10');
      handleGetBalance();
    }
  }, [matchedCards]);

  return (
    <div style={styles.container}>
      <h1 style={styles.headText}>神経衰弱ゲーム</h1>
      <label style={styles.descText}>Player: {name}</label>

      <div style={styles.descText}><a href={exurl}>YTTトークン: {balance}</a></div>
      <p style={styles.descText}>スコア: {score} - ターン数: {turns}</p>
      {gameOver && (
        <div>
          {score > 100 ? (
            <div>
              <p style={styles.specialMessage}>すごい！100点以上達成！おめでとう！</p>
              <p style={styles.getTokenMessage}>10 YTTトークンを取得しました！</p>
            </div>
          ) : (
            <div>
              <p>ゲームクリア！お疲れ様でした！</p>
              <p style={styles.getTokenMessage}>10 YTTトークンを取得しました！</p>
            </div>
          )}
        </div>
      )}

      {!gameStarted ? (
        <button onClick={startGame} style={styles.startButton}>
          ゲームスタート
        </button>
      ) : null}

      <div style={ isDesktop ? styles.board : styles.boardSp}>
        {shuffledCards.map((card, index) => {
          const isFlipped = flippedCards.includes(index) || matchedCards.includes(card.value);
          return (
            <div
              key={card.id}
              style={{
                ...styles.card,
                backgroundColor: isFlipped ? '#fff' : '#ccc',
                color: isFlipped ? '#000' : '#ccc',
                cursor: gameOver ? 'not-allowed' : 'pointer',
              }}
              onClick={() => handleCardClick(index)}
            >
              {isFlipped ? card.value : '❓'}
            </div>
          );
        })}
      </div>

      {gameOver && (
        <button onClick={startGame} style={styles.resetButton}>
          ゲームをリセット
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    marginTop: '20px',
  },
  headText: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'blue',
    margin: 0,
  },
  descText: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 100px)',
    gridGap: '10px',
    justifyContent: 'center',
    marginTop: '20px',
  },
  boardSp: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 100px)',
    gridGap: '10px',
    justifyContent: 'center',
    marginTop: '20px',
  },
  card: {
    width: '100px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
  startButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  resetButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#FF6347',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  specialMessage: {
    fontSize: '24px',
    color: '#FFD700', // 金色
    fontWeight: 'bold',
    marginTop: '20px',
  },
  getTokenMessage: {
    fontSize: '20px',
    color: '#0000ff',
    fontWeight: 'bold',
  },
};

export default App;
