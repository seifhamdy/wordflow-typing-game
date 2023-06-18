import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import './index.css'

const apiUrl = 'https://random-word-api.herokuapp.com/word?number=10'
const wordWidth = 200 // Width of each word in pixels
const fetchThreshold = 20 // Number of words remaining when new fetch is triggered

interface CaretProps {
  currentLetterIndex: number
  wordIndex: number
  words: string[]
}

const Caret: React.FC<CaretProps> = ({
  currentLetterIndex,
  wordIndex,
  words,
}) => {
  const caretRef = useRef<HTMLSpanElement>(null)
  const [caretStyle, setCaretStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    const updateCaretPosition = () => {
      const targetLetterId = `letter-${wordIndex}-${currentLetterIndex}`
      const targetLetter = document.getElementById(targetLetterId)
      const caretElement = caretRef.current

      if (targetLetter && caretElement) {
        const targetLetterRect = targetLetter.getBoundingClientRect()
        const caretStyle = {
          top: `${targetLetterRect.top}px`,
          left: `${targetLetterRect.left}px`,
          width: `${targetLetterRect.width}px`,
          height: `${targetLetterRect.height}px`,
          transition: 'top 0.3s, left 0.3s, width 0.3s, height 0.3s',
        }

        setCaretStyle(caretStyle)
      }
    }

    updateCaretPosition()
    window.addEventListener('resize', updateCaretPosition)
    return () => {
      window.removeEventListener('resize', updateCaretPosition)
    }
  }, [currentLetterIndex, wordIndex, words])

  useEffect(() => {
    const currentWord = words[wordIndex]

    if (currentWord && currentLetterIndex >= currentWord.length) {
      setCaretStyle({})
    }
  }, [currentLetterIndex, wordIndex, words])

  return (
    <span
      ref={caretRef as React.RefObject<HTMLSpanElement>}
      className={`absolute bg-blue-500 ${
        Object.keys(caretStyle).length === 0 ? 'hidden' : ''
      }`}
      style={{
        transition: 'left 0.2s ease-in-out',
        ...caretStyle,
      }}
    />
  )
}

function App() {
  const [words, setWords] = useState<string[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [wpm, setWPM] = useState(0)
  const [score, setScore] = useState(0)
  const [maxWordsInLine, setMaxWordsInLine] = useState(0)
  const wordRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [typingStarted, setTypingStarted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())
  const [completedWordIndex, setCompletedWordIndex] = useState(-1)
  const [currentWordWidth, setCurrentWordWidth] = useState(0)
  const activeWordRef = useRef<HTMLSpanElement>(null)
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    fetchWords()
    calculateMaxWordsInLine()
    window.addEventListener('resize', calculateMaxWordsInLine)
    return () => {
      window.removeEventListener('resize', calculateMaxWordsInLine)
    }
  }, [])

  useEffect(() => {
    setCurrentLetterIndex(0)
    setUserInput('')
  }, [currentWordIndex])

  useEffect(() => {
    if (activeWordRef.current) {
      setCurrentWordWidth(activeWordRef.current.offsetWidth)
      console.log(currentWordWidth)
      document.documentElement.style.setProperty(
        '--slide',
        '-' + String(currentWordWidth + 8) + 'px'
      )
    }
  }, [currentWordWidth, userInput])

  useEffect(() => {
    const updateWPM = () => {
      const currentTime = Date.now()
      const elapsedTime = (currentTime - startTime) / 1000 // Elapsed time in seconds
      const averageWPM = Math.round((score / elapsedTime) * 60)
      setWPM(averageWPM)
    }

    const timer = setInterval(updateWPM, 1000) // Update the WPM every second

    return () => clearInterval(timer)
  }, [startTime, score])

  useEffect(() => {
    const checkUserInput = () => {
      const currentWord = words[currentWordIndex]
      if (userInput.trim().toLowerCase() === currentWord.toLowerCase()) {
        setCompletedWordIndex(currentWordIndex)
        setTimeout(() => {
          setCurrentWordIndex((prevIndex) => prevIndex + 1)
          setCompletedWordIndex(-1)
        }, 100)
        setScore((prevScore) => prevScore + 1)
        setUserInput('')
        setCurrentLetterIndex(0)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!typingStarted) {
        setTypingStarted(true)
        setStartTime(Date.now())
      }
      if (event.key === ' ') {
        event.preventDefault()
        checkUserInput()
      } else if (event.key === 'Backspace' && userInput.length > 0) {
        setUserInput((prevInput) => prevInput.slice(0, -1))
        setCurrentLetterIndex(currentLetterIndex - 1)
      } else if (event.key.length === 1 && /^[a-zA-Z]+$/.test(event.key)) {
        const lowerCaseInput = event.key.toLowerCase() // Convert input to lowercase
        setUserInput((prevInput) => prevInput + lowerCaseInput)
        setCurrentLetterIndex(currentLetterIndex + 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    currentWordIndex,
    userInput,
    currentLetterIndex,
    words,
    typingStarted,
    score,
  ])

  useEffect(() => {
    if (wordRef.current) {
      wordRef.current.focus()
    }
  }, [currentWordIndex])

  useEffect(() => {
    if (words.length - currentWordIndex <= fetchThreshold) {
      fetchWords()
    }
  }, [currentWordIndex, words])

  const fetchWords = async () => {
    try {
      const response = await axios.get(apiUrl)
      setWords((prevWords) => [...prevWords, ...response.data])
      setIsLoaded(true)
    } catch (error) {
      console.error('Error fetching words:', error)
    }
  }

  const calculateMaxWordsInLine = () => {
    const availableWidth = window.innerWidth * 0.9
    const maxWords = Math.floor(availableWidth / wordWidth) + 4
    setMaxWordsInLine(maxWords)
  }

  useEffect(() => {
    const longestWordLength = Math.max(...words.map((word) => word.length))
    const containerWidth = longestWordLength * wordWidth
    setContainerWidth(containerWidth)
  }, [words])

  const renderWordsInLine = () => {
    const renderedWords: JSX.Element[] = []

    for (let i = 0; i < maxWordsInLine && i < words.length; i++) {
      const word = words[i + currentWordIndex]
      if (!word) break

      const isCurrentWord = i === 0
      const extraLetters = isCurrentWord ? userInput.slice(word.length) : ''

      const renderedWord: JSX.Element[] = []
      for (let j = 0; j < word.length; j++) {
        const letter = word[j]
        const isCurrentLetter = isCurrentWord && j === currentLetterIndex
        const isCorrectLetter =
          isCurrentWord &&
          j < userInput.length &&
          letter.toLowerCase() === userInput[j].toLowerCase()
        const isIncorrectLetter =
          isCurrentWord &&
          j < userInput.length &&
          letter.toLowerCase() !== userInput[j].toLowerCase()

        renderedWord.push(
          <span
            key={j}
            id={`letter-${i + currentWordIndex}-${j}`}
            className={`inline-block ${
              isCorrectLetter
                ? 'text-green-500'
                : isIncorrectLetter
                ? 'text-red-500'
                : 'inherit'
            }`}
          >
            <span className={isCurrentLetter ? 'animate-blink' : ''}>
              {isCorrectLetter || isIncorrectLetter ? userInput[j] : letter}
            </span>
          </span>
        )
      }

      for (let k = word.length; k < word.length + extraLetters.length; k++) {
        const letter = extraLetters[k - word.length]
        const isCurrentLetter = isCurrentWord && k === currentLetterIndex
        const isIncorrectLetter = isCurrentWord && letter !== undefined

        renderedWord.push(
          <span
            key={k}
            id={`letter-${i + currentWordIndex}-${k}`}
            className={`inline-block ${
              isIncorrectLetter ? 'text-red-500' : 'text-black'
            }`}
          >
            <span className={isCurrentLetter ? 'animate-blink' : ''}>
              {isIncorrectLetter ? letter : ''}
            </span>
          </span>
        )
      }

      renderedWords.push(
        <span
          key={i}
          className={`mr-2 word ${isCurrentWord ? 'active' : ''} ${
            completedWordIndex === i + currentWordIndex
              ? 'animate-complete'
              : completedWordIndex !== -1
              ? 'animate-slide-out'
              : ''
          }`}
          ref={isCurrentWord ? activeWordRef : undefined}
          style={{
            color: isCurrentWord && darkMode ? 'white' : '',
          }}
        >
          {renderedWord}
        </span>
      )
    }

    return renderedWords
  }

  return (
    <div
      className="flex justify-start items-center h-screen outline-none"
      tabIndex={0}
      ref={wordRef as React.RefObject<HTMLDivElement>}
      style={{
        backgroundColor: darkMode ? 'black' : 'white',
      }}
    >
      <div className="text-4xl text-center flex flex-col">
        {isLoaded && (
          <>
            <button
              style={{
                marginLeft: `${window.innerWidth * 0.125}px`,
              }}
              className={`button-28 ${darkMode ? 'button-29' : ''}`}
              role="button"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? 'Light mode' : 'Dark mode'}
            </button>
            <div
              className="flex justify-start word active align-middle mb-4"
              style={{
                marginLeft: `${window.innerWidth * 0.125}px`,
                color: darkMode ? 'white' : 'black',
              }}
            >
              WPM: {wpm}
            </div>
            <div
              className="flex space-x-2 justify-start"
              style={{
                marginLeft: `${window.innerWidth * 0.125}px`,
                width: `${containerWidth}px`,
              }}
            >
              {renderWordsInLine()}
            </div>
            <Caret
              currentLetterIndex={currentLetterIndex}
              wordIndex={currentWordIndex}
              words={words}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default App
