import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import Word from "./Word";

const App: React.FC = () => {
  const [input, setInput] = useState("");
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchRandomWords = async (count: number): Promise<string[]> => {
    try {
      const response = await fetch(`https://random-word-api.herokuapp.com/word?number=${count}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error fetching random words:", error);
      return [];
    }
  };

  const screenWidth = window.innerWidth;
  const wordsPerLine = Math.floor(screenWidth / 150); // Adjust the number based on your styling

  useEffect(() => {
    const fetchWords = async () => {
      const fetchedWords = await fetchRandomWords(wordsPerLine);
      setWords(fetchedWords);
      setCurrentWordIndex(0);
    };

    fetchWords();
  }, [wordsPerLine]);

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  
    const typedWord = e.target.value.trim();
    const currentCorrectWord = words[currentWordIndex];
  
    if (typedWord === currentCorrectWord && e.target.value.endsWith(" ")) {
      setInput("");
      setScore((prevScore) => prevScore + 1);
  
      const newWords = [...words];
      newWords.splice(currentWordIndex, 1);
      const fetchedWord = (await fetchRandomWords(1))[0];
      newWords.push(fetchedWord);
      setWords(newWords);
  
      setCurrentWordIndex((prevIndex) => Math.min(prevIndex, newWords.length - 1));
      setWordCount((prevCount) => prevCount + 1);
    }
  };
  

  useEffect(() => {
    if (startTime !== null) {
      const elapsedTime = Date.now() - startTime;
      const minutes = elapsedTime / 1000 / 60;
      const wpm = Math.round(wordCount / minutes);
      console.log("WPM:", wpm);
    }
  }, [startTime, wordCount]);

  const handleInputFocus = () => {
    setStartTime(Date.now());
  };

  return (
    <div className="App">
      <h1>Typing Game</h1>
      <p>Score: {score}</p>
      <p>Words per Minute: {Math.round((wordCount / ((Date.now() - (startTime || Date.now())) / 1000 / 60))) || 0}</p>
      {words.map((word, index) => (
        <Word key={index} text={word} isActive={index === currentWordIndex} />
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
      />
    </div>
  );
};

export default App;
