import React, { useState, useEffect, useRef, useCallback } from 'react';
import Mouse from './Mouse';
import TouchFeedback from './TouchFeedback';
import CaptureEffect from './CaptureEffect';

const GameArea = ({ speed, isFullscreen }) => {
  const gameAreaRef = useRef(null);
  const animationFrameRef = useRef();
  const mousePositionRef = useRef({ x: 100, y: 100 });
  const velocityRef = useRef({ vx: 1, vy: 1 });
  const [mousePosition, setMousePosition] = useState({ x: 100, y: 100 });
  const [isEscaping, setIsEscaping] = useState(false);
  const [touches, setTouches] = useState([]);
  const [captures, setCaptures] = useState([]);
  const escapeTimeoutRef = useRef();
  const touchIdRef = useRef(0);
  const captureIdRef = useRef(0);

  // 简化的速度计算，回到最初版本
  const getRandomVelocity = useCallback((angle = null) => {
    const finalAngle = angle !== null ? angle : Math.random() * Math.PI * 2;
    const baseSpeed = speed * 0.3; // 降低基础速度
    return {
      vx: Math.cos(finalAngle) * baseSpeed,
      vy: Math.sin(finalAngle) * baseSpeed
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

    const isHit = distance < 80;

    // 添加触摸反馈
    const newTouch = {
      id: touchIdRef.current++,
      x: touchX,
      y: touchY,
      hit: isHit,
      timestamp: Date.now()
    };

    setTouches(prev => [...prev, newTouch]);

    // 清除旧的触摸点
    setTimeout(() => {
      setTouches(prev => prev.filter(t => t.id !== newTouch.id));
    }, 600);

    if (isHit) {
      // 添加捕获成功效果
      const newCapture = {
        id: captureIdRef.current++,
        x: touchX,
        y: touchY,
        timestamp: Date.now()
      };

      setCaptures(prev => [...prev, newCapture]);

      // 清除旧的捕获效果
      setTimeout(() => {
        setCaptures(prev => prev.filter(c => c.id !== newCapture.id));
      }, 1200);

      const escapeAngle = Math.atan2(
        mousePositionRef.current.y - touchY,
        mousePositionRef.current.x - touchX
      );
      
      const escapeSpeed = speed * 2.5; // 降低逃跑速度
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
      }, 600);
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
      
      const escapeSpeed = speed * 2; // 降低速度
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

      // 简化的边界碰撞检测
      if (newX <= 25 || newX >= rect.width - 25) {
        velocityRef.current.vx = -vx * (0.8 + Math.random() * 0.4);
        newX = Math.max(25, Math.min(rect.width - 25, newX));
      }

      if (newY <= 25 || newY >= rect.height - 25) {
        velocityRef.current.vy = -vy * (0.8 + Math.random() * 0.4);
        newY = Math.max(25, Math.min(rect.height - 25, newY));
      }

      // 随机方向变化（降低概率）
      if (Math.random() < 0.005 && !isEscaping) {
        const angle = Math.random() * Math.PI * 2;
        const baseSpeed = speed * 0.3;
        velocityRef.current = {
          vx: Math.cos(angle) * baseSpeed,
          vy: Math.sin(angle) * baseSpeed
        };
      }

      // 随机速度变化（降低概率）
      if (Math.random() < 0.003 && !isEscaping) {
        const speedMultiplier = 0.7 + Math.random() * 0.6;
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
  }, [speed, isEscaping, getRandomVelocity]);

  return (
    <div
      ref={gameAreaRef}
      className="relative w-full h-full overflow-hidden cursor-pointer"
      style={{ backgroundColor: '#101010', touchAction: 'none' }}
      onTouchStart={handleTouch}
      onTouchMove={handleTouch}
      onClick={handleClick}
    >
      <Mouse
        x={mousePosition.x}
        y={mousePosition.y}
        size={50}
        isEscaping={isEscaping}
        velocity={velocityRef.current}
      />
      <TouchFeedback touches={touches} />
      <CaptureEffect captures={captures} />
    </div>
  );
};

export default GameArea;