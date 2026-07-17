/**********************************************
 * STARTER CODE
 **********************************************/

/**
 * shuffle()
 * Shuffle the contents of an array
 *   depending the datatype of the source
 * Makes a copy. Does NOT shuffle the original.
 * Based on Steve Griffith's array shuffle prototype
 * @Parameters: Array or string
 * @Return: Scrambled Array or string, based on the provided parameter
 */
function shuffle (src) {
  const copy = [...src]

  const length = copy.length
  for (let i = 0; i < length; i++) {
    const x = copy[i]
    const y = Math.floor(Math.random() * length)
    const z = copy[y]
    copy[i] = z
    copy[y] = x
  }

  if (typeof src === 'string') {
    return copy.join('')
  }

  return copy
}

/**********************************************
 * YOUR CODE BELOW
 **********************************************/





const wordList = [
  'ball', 'car', 'road', 'trees', 'concern', 'browser', 'read', 'international', 'school', 'dictation', 'violin', 'beaver'
]
 
const maxStrikes = 3
const maxPasses = 3
const STORAGE_KEY = 'scrambleGameState'
 

function scrambleWord (word) {
  let scrambled = shuffle(word)
  let attempts = 0
  while (scrambled === word && attempts < 10) {
    scrambled = shuffle(word)
    attempts++
  }
  return scrambled
}
 

function createNewGame () {
  const shuffledWords = shuffle(wordList)
  const firstWord = shuffledWords[0]
  const remainingWords = shuffledWords.slice(1)
 
  return {
    words: remainingWords,
    currentWord: firstWord,
    scrambled: scrambleWord(firstWord),
    points: 0,
    strikes: 0,
    passesRemaining: maxPasses,
    message: 'Guess the scrambled word!',
    gameOver: false,
    win: false
  }
}
 

function loadGame () {
  const saved = localStorage.getItem(STORAGE_KEY)
 
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (error) {
      return createNewGame()
    }
  }
 
  return createNewGame()
}
 

function saveGame (state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
 

function ScoreBoard (props) {
  return (
    <div className="score-board">
      <div className="score-item">
        <span className="score-label">Points</span>
        <span className="score-value">{props.points}</span>
      </div>
      <div className="score-item">
        <span className="score-label">Strikes</span>
        <span className="score-value">{props.strikes} / {maxStrikes}</span>
      </div>
      <div className="score-item">
        <span className="score-label">Passes</span>
        <span className="score-value">{props.passesRemaining}</span>
      </div>
    </div>
  )
}
 

function Message (props) {
  if (!props.text) {
    return ''
  }
 
  const className = `message ${props.type ? 'message-' + props.type : ''}`
  return (<p className={className}>{props.text}</p>)
}
 

function Panel (props) {
  return (<div className="panel">{props.children}</div>)
}
 
function GameOver (props) {
  return (
    <Panel>
      <h2>{props.win ? 'You Win!' : 'Game Over'}</h2>
      <p>Final Score: {props.points}</p>
      <button className="restart-button" onClick={props.onRestart}>
        Play Again
      </button>
    </Panel>
  )
}
 
function App () {
  const [gameState, setGameState] = React.useState(loadGame)
  const [guessInput, setGuessInput] = React.useState('')
 
  const {
    words,
    currentWord,
    scrambled,
    points,
    strikes,
    passesRemaining,
    message,
    gameOver,
    win
  } = gameState
 

  function updateGame (changes) {
    const updated = { ...gameState, ...changes }
    setGameState(updated)
    saveGame(updated)
  }
 

  function getNextWordState (remainingWords) {
    if (remainingWords.length === 0) {
      return {
        words: [],
        currentWord: '',
        scrambled: '',
        gameOver: true,
        win: true,
        message: 'You made it through every word!'
      }
    }
 
    const nextWord = remainingWords[0]
    const restOfWords = remainingWords.slice(1)
 
    return {
      words: restOfWords,
      currentWord: nextWord,
      scrambled: scrambleWord(nextWord)
    }
  }
 
  function handleInputChange (event) {
    setGuessInput(event.target.value)
  }
 
  function handleKeyDown (event) {
    if (event.key === 'Enter') {
      handleGuess()
    }
  }
 
  function handleGuess () {
    if (gameOver) {
      return
    }
 
    const guess = guessInput.trim().toLowerCase()
    setGuessInput('')
 
    if (guess.length === 0) {
      return
    }
 
    if (guess === currentWord) {
      const nextWordState = getNextWordState(words)
      updateGame({
        points: points + 1,
        message: nextWordState.gameOver ? nextWordState.message : 'Correct!',
        ...nextWordState
      })
      return
    }
 
    const newStrikes = strikes + 1
 
    if (newStrikes >= maxStrikes) {
      updateGame({
        strikes: newStrikes,
        message: 'Out of strikes!',
        gameOver: true,
        win: false
      })
    } else {
      updateGame({
        strikes: newStrikes,
        message: 'Incorrect, try again.'
      })
    }
  }
 
  function handlePass () {
    if (gameOver || passesRemaining <= 0) {
      return
    }
 
    const nextWordState = getNextWordState(words)
    updateGame({
      passesRemaining: passesRemaining - 1,
      message: nextWordState.gameOver ? nextWordState.message : 'Word passed.',
      ...nextWordState
    })
  }
 
  function handleRestart () {
    const fresh = createNewGame()
    setGameState(fresh)
    saveGame(fresh)
    setGuessInput('')
  }
 
  if (gameOver) {
    return (
      <div className="app">
        <h1>Scramble</h1>
        <GameOver win={win} points={points} onRestart={handleRestart} />
      </div>
    )
  }
 
  return (
    <div className="app">
      <h1>Scramble</h1>
      <ScoreBoard
        points={points}
        strikes={strikes}
        passesRemaining={passesRemaining}
      />
      <div className="scrambled-word">{scrambled}</div>
      <Message text={message} />
      <input
        type="text"
        className="guess-input"
        value={guessInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your guess and hit Enter"
        autoFocus
      />
      <button
        className="pass-button"
        onClick={handlePass}
        disabled={passesRemaining <= 0}
      >
        Pass ({passesRemaining} remaining)
      </button>
    </div>
  )
}
 
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
