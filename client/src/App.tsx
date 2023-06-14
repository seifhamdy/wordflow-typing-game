import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const apiUrl = 'https://random-word-api.herokuapp.com/word?number=10'; // API endpoint to fetch random words
const wordWidth = 200; // Width of each word in pixels

function App() {
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [maxWordsInLine, setMaxWordsInLine] = useState(0);
  const wordRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchWords();
    calculateMaxWordsInLine();
    window.addEventListener('resize', calculateMaxWordsInLine);
    return () => {
      window.removeEventListener('resize', calculateMaxWordsInLine);
    };
  }, []);

  useEffect(() => {
    setCurrentLetterIndex(0);
    setUserInput('');
  }, [currentWordIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        event.preventDefault();
        checkUserInput();
      } else if (event.key === 'Backspace' && userInput.length > 0) {
        setUserInput(userInput.slice(0, -1));
        setCurrentLetterIndex(currentLetterIndex - 1);
      } else if (event.key.length === 1 && /^[a-zA-Z]+$/.test(event.key)) {
        setUserInput(userInput + event.key);
        setCurrentLetterIndex(currentLetterIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentWordIndex, userInput, currentLetterIndex]);

  const fetchWords = async () => {
    try {
      const response = await axios.get(apiUrl);
      setWords(response.data);
    } catch (error) {
      console.error('Error fetching words:', error);
    }
  };

  const checkUserInput = () => {
    const currentWord = words[currentWordIndex];
    if (userInput.trim().toLowerCase() === currentWord.toLowerCase()) {
      setCurrentWordIndex(currentWordIndex + 1);
      setScore(score + 1);
    }
  };

  useEffect(() => {
    if (wordRef.current) {
      wordRef.current.focus();
    }
  }, [currentWordIndex]);

  const calculateMaxWordsInLine = () => {
    const availableWidth = window.innerWidth * 0.9; // Use 90% of the window width
    const maxWords = Math.floor(availableWidth / wordWidth);
    setMaxWordsInLine(maxWords);
  };

  const renderWordsInLine = () => {
    const renderedWords: JSX.Element[] = [];
    for (let i = 0; i < maxWordsInLine && i < words.length; i++) {
      const word = words[i];
      const isCurrentWord = i === currentWordIndex;
      const isActive = isCurrentWord && currentLetterIndex < word.length;
  
      const renderedWord: JSX.Element[] = [];
      for (let j = 0; j < word.length; j++) {
        const letter = word[j];
        const isCurrentLetter = isCurrentWord && j === currentLetterIndex;
  
        renderedWord.push(
          <span
            key={j}
            className={`inline-block ${
              isCurrentLetter ? 'bg-yellow-200' : 'text-black'
            }`}
          >
            <span
              className={`${
                isCurrentLetter ? 'animate-blink' : ''
              }`}
            >
              {letter}
            </span>
          </span>
        );
      }
  
      renderedWords.push(
        <span
          key={i}
          className={`mr-2 ${
            isCurrentWord ? 'font-bold text-black' : 'text-gray-500'
          }`}
        >
          {renderedWord}
        </span>
      );
    }
  
    return renderedWords;
  };

  return (
    <div
      className="flex justify-center items-center h-screen"
      tabIndex={0}
      ref={wordRef as React.RefObject<HTMLDivElement>}
    >
      <div className="text-4xl text-center">
        <div>
          Score: <span className="font-bold">{score}</span>
        </div>
        <div className="flex space-x-2">{renderWordsInLine()}</div>
      </div>
    </div>
  );
}

export default App;
