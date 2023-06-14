import React, { useState, useEffect, ChangeEvent, useRef } from 'react'
import Word from './Word'

const App: React.FC = () => {
  const [input, setInput] = useState('')
  const [words, setWords] = useState<string[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [wordCount, setWordCount] = useState(0)
  const [elapsedTime, setElapsedTime] = useState<number>(0)
  const [wordsPerMinute, setWordsPerMinute] = useState(0)
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchRandomWords = async (count: number): Promise<string[]> => {
    try {
      const response = await fetch(
        `https://random-word-api.herokuapp.com/word?number=${count}`
      )
      const data = await response.json()
      return data
    } catch (error) {
      console.log('Error fetching random words:', error)
      return []
    }
  }

  const wordsPerLine = 7 // Set the number of words per line

  useEffect(() => {
    const fetchWords = async () => {
      const fetchedWords = await fetchRandomWords(wordsPerLine)
      setWords(fetchedWords)
      setCurrentWordIndex(0)
    }

    fetchWords()
  }, [wordsPerLine])

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)

    if (!startTime) {
      setStartTime(Date.now())
    }

    const typedWord = e.target.value.trim()
    const currentCorrectWord = words[currentWordIndex]

    if (typedWord === currentCorrectWord && e.target.value.endsWith(' ')) {
      setInput('')
      setScore((prevScore) => prevScore + 1)

      const newWords = [...words]
      newWords.splice(currentWordIndex, 1)
      const fetchedWord = (await fetchRandomWords(1))[0]
      newWords.push(fetchedWord)
      setWords(newWords)

      setCurrentWordIndex((prevIndex) =>
        Math.min(prevIndex, newWords.length - 1)
      )
      setWordCount((prevCount) => prevCount + 1)
      setCurrentLetterIndex(0)
    } else {
      setCurrentLetterIndex(typedWord.length)
    }
  }

  useEffect(() => {
    if (startTime !== null) {
      const interval = setInterval(() => {
        const elapsedTimeInSeconds = Math.floor((Date.now() - startTime) / 1000)
        setElapsedTime(elapsedTimeInSeconds)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [startTime])

  useEffect(() => {
    if (elapsedTime > 0 && wordCount > 0) {
      const wordsPerMinuteValue = Math.round((wordCount / elapsedTime) * 60)
      setWordsPerMinute(wordsPerMinuteValue)
    } else {
      setWordsPerMinute(0)
    }
  }, [elapsedTime, wordCount])

  const handleDocumentMouseDown = (e: MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
      e.preventDefault()
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleDocumentMouseDown)

    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown)
    }
  }, [])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  })

  return (
    <div className="bg-black h-screen flex flex-col justify-center items-center">
      <h1 className="text-white text-3xl font-bold mb-4">Typing Game</h1>
      <p className="text-white">Score: {score}</p>
      <p className="text-white">Words per Minute: {wordsPerMinute}</p>
      <div className="flex justify-center mt-4">
        {words.map((word, index) => (
          <React.Fragment key={index}>
            <Word
              text={word}
              isActive={index === currentWordIndex}
              typedInput={input}
              currentLetterIndex={currentLetterIndex}
              className={
                index === currentWordIndex ? 'text-white' : 'text-gray-400'
              }
            />
            &nbsp;
          </React.Fragment>
        ))}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInputChange}
        className="absolute w-0 h-0 opacity-0"
      />
    </div>
  )
}

export default App
