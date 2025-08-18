import React, { useState, useEffect, useRef, useCallback } from 'react';
import Mouse from './Mouse';
import TouchFeedback from './TouchFeedback';

const GameArea = ({ speed, isFullscreen }) => {
  const gameAreaRef = useRef(null);
  const animationFrameRef = useRef();
  const mousePositionRef = useRef({ x: 100, y: 100 });
  const velocityRef = useRef({ vx: 1, vy: 1 });
  const [mousePosition, setMousePosition] = useState({ x: 100, y: 100 });
  const [isEscaping, setIsEscaping] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [touches, setTouches] = useState([]);
  const escapeTimeoutRef = useRef();
  const behaviorStateRef = useRef('exploring'); // exploring, hunting, resting, hiding
  const lastDirectionChangeRef = useRef(0);
  const pauseTimeRef = useRef(0);
  const touchIdRef = useRef(0);

  const getRandomVelocity = useCallback(() => {
    const angle = Math.random() * Math.PI * 2;
    let baseSpeed = speed * 0.5;
    
    // 根据行为状态调整速度
    switch(behaviorStateRef.current) {
      case 'exploring':
        baseSpeed *= 0.8;
        break;
      case 'hunting':
        baseSpeed *= 1.3;
        break;
      case 'resting':
        baseSpeed *= 0.3;
        break;
      case 'hiding':
        baseSpeed *= 0.1;
        break;
      default:
        break;
    }
    
    return {
      vx: Math.cos(angle) * baseSpeed,
      vy: Math.sin(angle) * baseSpeed
    };
  }, [speed]);

  const updateBehaviorState = useCallback(() => {
    const now = Date.now();
    const random = Math.random();
    
    // 每3-8秒随机改变行为状态
    if (now - lastDirectionChangeRef.current > (3000 + Math.random() * 5000)) {
      lastDirectionChangeRef.current = now;
      
      if (random < 0.4) {
        behaviorStateRef.current = 'exploring';
      } else if (random < 0.6) {
        behaviorStateRef.current = 'hunting';
      } else if (random < 0.8) {
        behaviorStateRef.current = 'resting';
        pauseTimeRef.current = now;
      } else {
        behaviorStateRef.current = 'hiding';
        setIsHiding(true);
        setTimeout(() => setIsHiding(false), 1000 + Math.random() * 2000);
      }
    }
  }, []);

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

    const isHit = distance < 90;

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
      const escapeAngle = Math.atan2(
        mousePositionRef.current.y - touchY,
        mousePositionRef.current.x - touchX
      );
      
      const escapeSpeed = speed * 4; // 增加逃跑速度
      velocityRef.current = {
        vx: Math.cos(escapeAngle) * escapeSpeed,
        vy: Math.sin(escapeAngle) * escapeSpeed
      };

      setIsEscaping(true);
      behaviorStateRef.current = 'hiding'; // 被抓到后进入隐藏状态
      
      if (escapeTimeoutRef.current) {
        clearTimeout(escapeTimeoutRef.current);
      }
      
      escapeTimeoutRef.current = setTimeout(() => {
        setIsEscaping(false);
        behaviorStateRef.current = 'exploring';
        velocityRef.current = getRandomVelocity();
      }, 800);
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
      const now = Date.now();

      // 更新行为状态
      updateBehaviorState();

      // 处理休息状态的暂停
      if (behaviorStateRef.current === 'resting' && now - pauseTimeRef.current < 2000) {
        // 暂停移动2秒
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      let newX = x + vx;
      let newY = y + vy;

      // 边界碰撞检测，增加更自然的反弹
      if (newX <= 40 || newX >= rect.width - 40) {
        velocityRef.current.vx = -vx * (0.8 + Math.random() * 0.4);
        newX = Math.max(40, Math.min(rect.width - 40, newX));
        // 边界碰撞时改变行为状态
        behaviorStateRef.current = 'exploring';
      }

      if (newY <= 40 || newY >= rect.height - 40) {
        velocityRef.current.vy = -vy * (0.8 + Math.random() * 0.4);
        newY = Math.max(40, Math.min(rect.height - 40, newY));
        // 边界碰撞时改变行为状态
        behaviorStateRef.current = 'exploring';
      }

      // 更自然的方向改变逻辑
      if (!isEscaping) {
        // 根据行为状态调整方向改变频率
        let changeProb = 0.005;
        switch(behaviorStateRef.current) {
          case 'hunting':
            changeProb = 0.02; // 狩猎时更频繁改变方向
            break;
          case 'exploring':
            changeProb = 0.01;
            break;
          case 'hiding':
            changeProb = 0.001; // 隐藏时几乎不改变方向
            break;
        }

        if (Math.random() < changeProb) {
          velocityRef.current = getRandomVelocity();
        }

        // 添加微小的随机扰动，模拟真实动物的不规律移动
        if (Math.random() < 0.1) {
          const perturbation = 0.2;
          velocityRef.current.vx += (Math.random() - 0.5) * perturbation;
          velocityRef.current.vy += (Math.random() - 0.5) * perturbation;
        }
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
  }, [speed, isEscaping, updateBehaviorState, getRandomVelocity]);

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
        size={45}
        isEscaping={isEscaping}
        isHiding={isHiding}
        behaviorState={behaviorStateRef.current}
      />
      <TouchFeedback touches={touches} />
    </div>
  );
};

export default GameArea;