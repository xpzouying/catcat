import React, { useState, useEffect, useRef, useCallback } from 'react';
import Mouse from './Mouse';

const GameArea = ({ speed, isFullscreen }) => {
  const gameAreaRef = useRef(null);
  const animationFrameRef = useRef();
  const mousePositionRef = useRef({ x: 100, y: 100 });
  const velocityRef = useRef({ vx: 1, vy: 1 });
  const [mousePosition, setMousePosition] = useState({ x: 100, y: 100 });
  const [isEscaping, setIsEscaping] = useState(false);
  const escapeTimeoutRef = useRef();

  const getRandomVelocity = useCallback(() => {
    const angle = Math.random() * Math.PI * 2;
    const baseSpeed = speed * 0.5;
    return {
      vx: Math.cos(angle) * baseSpeed,
      vy: Math.sin(angle) * baseSpeed
    };
  }, [speed]);

  const handleTouch = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0] || e.changedTouches[0];
    const rect = gameAreaRef.current.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    const distance = Math.sqrt(
      Math.pow(touchX - mousePositionRef.current.x, 2) +
      Math.pow(touchY - mousePositionRef.current.y, 2)
    );

    if (distance < 80) {
      const escapeAngle = Math.atan2(
        mousePositionRef.current.y - touchY,
        mousePositionRef.current.x - touchX
      );
      
      const escapeSpeed = speed * 3;
      velocityRef.current = {
        vx: Math.cos(escapeAngle) * escapeSpeed,
        vy: Math.sin(escapeAngle) * escapeSpeed
      };

      setIsEscaping(true);
      
      if (escapeTimeoutRef.current) {
        clearTimeout(escapeTimeoutRef.current);
      }
      
      escapeTimeoutRef.current = setTimeout(() => {
        setIsEscaping(false);
        velocityRef.current = getRandomVelocity();
      }, 500);
    }
  }, [speed, getRandomVelocity]);

  const handleClick = useCallback((e) => {
    const rect = gameAreaRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const distance = Math.sqrt(
      Math.pow(clickX - mousePositionRef.current.x, 2) +
      Math.pow(clickY - mousePositionRef.current.y, 2)
    );

    if (distance < 80) {
      const escapeAngle = Math.atan2(
        mousePositionRef.current.y - clickY,
        mousePositionRef.current.x - clickX
      );
      
      const escapeSpeed = speed * 3;
      velocityRef.current = {
        vx: Math.cos(escapeAngle) * escapeSpeed,
        vy: Math.sin(escapeAngle) * escapeSpeed
      };

      setIsEscaping(true);
      
      if (escapeTimeoutRef.current) {
        clearTimeout(escapeTimeoutRef.current);
      }
      
      escapeTimeoutRef.current = setTimeout(() => {
        setIsEscaping(false);
        velocityRef.current = getRandomVelocity();
      }, 500);
    }
  }, [speed, getRandomVelocity]);

  useEffect(() => {
    velocityRef.current = getRandomVelocity();
  }, [getRandomVelocity]);

  useEffect(() => {
    const animate = () => {
      if (!gameAreaRef.current) return;

      const rect = gameAreaRef.current.getBoundingClientRect();
      const { x, y } = mousePositionRef.current;
      const { vx, vy } = velocityRef.current;

      let newX = x + vx;
      let newY = y + vy;

      if (newX <= 25 || newX >= rect.width - 25) {
        velocityRef.current.vx = -vx;
        newX = Math.max(25, Math.min(rect.width - 25, newX));
      }

      if (newY <= 25 || newY >= rect.height - 25) {
        velocityRef.current.vy = -vy;
        newY = Math.max(25, Math.min(rect.height - 25, newY));
      }

      if (Math.random() < 0.02 && !isEscaping) {
        const angle = Math.random() * Math.PI * 2;
        const baseSpeed = speed * 0.5;
        velocityRef.current = {
          vx: Math.cos(angle) * baseSpeed,
          vy: Math.sin(angle) * baseSpeed
        };
      }

      if (Math.random() < 0.01 && !isEscaping) {
        const speedMultiplier = 0.8 + Math.random() * 0.4;
        velocityRef.current.vx *= speedMultiplier;
        velocityRef.current.vy *= speedMultiplier;
      }

      mousePositionRef.current = { x: newX, y: newY };
      setMousePosition({ x: newX, y: newY });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [speed, isEscaping]);

  return (
    <div
      ref={gameAreaRef}
      className="relative w-full h-full bg-gray-800 overflow-hidden cursor-pointer"
      onTouchStart={handleTouch}
      onTouchMove={handleTouch}
      onClick={handleClick}
      style={{ touchAction: 'none' }}
    >
      <Mouse
        x={mousePosition.x}
        y={mousePosition.y}
        isEscaping={isEscaping}
      />
    </div>
  );
};

export default GameArea;