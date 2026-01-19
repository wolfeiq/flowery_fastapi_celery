import { useHumaneFont } from '@/hooks/humaneFonts';
import React, { useState, useEffect } from 'react';

export default function CurvedText() {
  const lines = [
    { text: `And how do your`, size: 'text-[10rem]', weight: 'font-normal' },
    { text: 'Memories Smell?', size: 'text-[9rem] sm:text-[12rem] md:text-[15rem] lg:text-[21rem] xl:text-[25rem]', weight: 'font-semibold' },
  ];
  
  const [displayedLines, setDisplayedLines] = useState(['', '', '']);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useHumaneFont();

  useEffect(() => {
    if (currentLineIndex < lines.length) {
      const currentLine = lines[currentLineIndex].text;
      if (currentCharIndex < currentLine.length) {
        const timeout = setTimeout(() => {
          const newDisplayedLines = [...displayedLines];
          newDisplayedLines[currentLineIndex] = currentLine.slice(0, currentCharIndex + 1);
          setDisplayedLines(newDisplayedLines);
          setCurrentCharIndex(currentCharIndex + 1);
        }, 80);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setCurrentLineIndex(currentLineIndex + 1);
          setCurrentCharIndex(0);
        }, 300);
        return () => clearTimeout(timeout);
      }
    }
  }, [currentCharIndex, currentLineIndex, displayedLines, lines]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen pt-[120px] flex justify-center pointer-events-none">
      <div className="text-center text-white -space-y-8" style={{ fontFamily: "'HUMANE', sans-serif" }}>
        {lines.map((line, index) => (
          <div key={index} className={`${line.size} ${line.weight} leading-none`}>
            {displayedLines[index]}
            {index === currentLineIndex && showCursor && currentLineIndex < lines.length ? '▌' : ''}
          </div>
        ))}
      </div>
    </div>
  );
}