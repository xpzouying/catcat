import React from 'react';

const SpeedControl = ({ speed, setSpeed, isFullscreen }) => {
  if (isFullscreen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-sm p-4 z-50">
      <div className="max-w-md mx-auto flex items-center gap-4">
        <label htmlFor="speed" className="text-white text-sm font-medium">
          速度:
        </label>
        <input
          id="speed"
          type="range"
          min="1"
          max="10"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-white text-sm font-medium w-8 text-center">
          {speed}
        </span>
      </div>
    </div>
  );
};

export default SpeedControl;