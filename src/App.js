import React, { useState, useEffect, useRef } from 'react';
import GameArea from './components/GameArea';
import SpeedControl from './components/SpeedControl';
import './App.css';

function App() {
  const [speed, setSpeed] = useState(5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const appRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const touchStartTimeRef = useRef(null);

  const enterFullscreen = () => {
    const elem = appRef.current;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
    setIsFullscreen(true);
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setIsFullscreen(false);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const isCorner = 
      (touch.clientX < 100 && touch.clientY < 100) ||
      (touch.clientX > window.innerWidth - 100 && touch.clientY < 100) ||
      (touch.clientX < 100 && touch.clientY > window.innerHeight - 100) ||
      (touch.clientX > window.innerWidth - 100 && touch.clientY > window.innerHeight - 100);

    if (isCorner && isFullscreen) {
      touchStartTimeRef.current = Date.now();
      longPressTimerRef.current = setTimeout(() => {
        exitFullscreen();
      }, 3000);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div 
      ref={appRef}
      className="w-screen h-screen bg-gray-900 relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {!isFullscreen && (
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={enterFullscreen}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            全屏
          </button>
        </div>
      )}
      
      <div className={`w-full ${isFullscreen ? 'h-full' : 'h-[calc(100vh-80px)]'}`}>
        <GameArea speed={speed} isFullscreen={isFullscreen} />
      </div>
      
      <SpeedControl 
        speed={speed} 
        setSpeed={setSpeed}
        isFullscreen={isFullscreen}
      />
    </div>
  );
}

export default App;
