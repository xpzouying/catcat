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
  const [isHiding] = useState(false);
  const [touches, setTouches] = useState([]);
  const [captures, setCaptures] = useState([]);
  const escapeTimeoutRef = useRef();
  const behaviorStateRef = useRef('stalking'); // stalking, dashing, observing, palm_trajectory, fake_move, escape_mode
  // Removed unused refs
  const touchIdRef = useRef(0);
  const captureIdRef = useRef(0);
  const movementPhaseRef = useRef('direct'); // direct, turning, pausing
  const phaseStartTimeRef = useRef(0);
  const escapeCountdownRef = useRef(Math.random() * 20000 + 10000); // 10-30秒后触发逃窜

  const getSpeedByBehavior = useCallback((behavior) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return speed * 0.5;
    
    const screenWidthPerSecond = rect.width; // 1个屏幕宽/秒
    let targetSpeed;
    
    switch(behavior) {
      case 'stalking': // 潜行慢移
        targetSpeed = (0.8 + Math.random() * 0.7) * screenWidthPerSecond / 60; // 0.8-1.5 屏幕宽/秒
        break;
      case 'dashing': // 冲刺爆发
        targetSpeed = (2.0 + Math.random() * 1.0) * screenWidthPerSecond / 60; // 2-3 屏幕宽/秒
        break;
      case 'observing': // 观望停顿
        targetSpeed = 0; // 静止
        break;
      case 'escape_mode': // 逃窜模式
        targetSpeed = (2.5 + Math.random() * 0.5) * screenWidthPerSecond / 60; // 2.5-3 屏幕宽/秒
        break;
      default:
        targetSpeed = 1.0 * screenWidthPerSecond / 60; // 默认 1 屏幕宽/秒
        break;
    }
    
    return targetSpeed * speed; // 乘以用户设置的速度系数
  }, [speed]);
  
  const getRandomVelocity = useCallback((angle = null) => {
    const finalAngle = angle !== null ? angle : Math.random() * Math.PI * 2;
    const targetSpeed = getSpeedByBehavior(behaviorStateRef.current);
    
    return {
      vx: Math.cos(finalAngle) * targetSpeed,
      vy: Math.sin(finalAngle) * targetSpeed
    };
  }, [getSpeedByBehavior]);

  const updateMovementPattern = useCallback(() => {
    const now = Date.now();
    const phaseElapsed = now - phaseStartTimeRef.current;
    
    // 棕榈轨迹模式：直行 → 急转 → 微停 循环
    switch(movementPhaseRef.current) {
      case 'direct': // 直行阶段 300-800ms
        if (phaseElapsed > 300 + Math.random() * 500) {
          movementPhaseRef.current = 'turning';
          phaseStartTimeRef.current = now;
          behaviorStateRef.current = 'dashing'; // 急转时突然加速
          
          // 急转 30-90度
          const currentAngle = Math.atan2(velocityRef.current.vy, velocityRef.current.vx);
          const turnAngle = (30 + Math.random() * 60) * (Math.PI / 180) * (Math.random() < 0.5 ? 1 : -1);
          const newAngle = currentAngle + turnAngle;
          velocityRef.current = getRandomVelocity(newAngle);
        }
        break;
        
      case 'turning': // 转向阶段，短暂
        if (phaseElapsed > 100) {
          movementPhaseRef.current = 'pausing';
          phaseStartTimeRef.current = now;
          behaviorStateRef.current = 'observing'; // 停顿观望
        }
        break;
        
      case 'pausing': // 微停阶段 150-300ms
        if (phaseElapsed > 150 + Math.random() * 150) {
          movementPhaseRef.current = 'direct';
          phaseStartTimeRef.current = now;
          behaviorStateRef.current = 'stalking'; // 回到潜行状态
          velocityRef.current = getRandomVelocity(); // 新方向
        }
        break;
        
      default:
        // 默认重置为直行状态
        movementPhaseRef.current = 'direct';
        phaseStartTimeRef.current = now;
        behaviorStateRef.current = 'stalking';
        break;
    }
    
    // 假动作：5%概率触发
    if (Math.random() < 0.05 && movementPhaseRef.current === 'direct') {
      movementPhaseRef.current = 'fake_move';
      phaseStartTimeRef.current = now;
      
      // 向前冲刺
      velocityRef.current.vx *= 2;
      velocityRef.current.vy *= 2;
      
      setTimeout(() => {
        // 80-120ms后回拉
        velocityRef.current.vx *= -1.5;
        velocityRef.current.vy *= -1.5;
        
        setTimeout(() => {
          // 再等200ms后恢复正常
          movementPhaseRef.current = 'direct';
          phaseStartTimeRef.current = Date.now();
          behaviorStateRef.current = 'stalking';
          velocityRef.current = getRandomVelocity();
        }, 200);
      }, 80 + Math.random() * 40);
    }
    
    // 逃窜模式检查
    if (now > escapeCountdownRef.current) {
      behaviorStateRef.current = 'escape_mode';
      escapeCountdownRef.current = now + 20000 + Math.random() * 20000; // 下一次逃窜 20-40秒后
      
      // 高速爆发向屏幕边缘
      const rect = gameAreaRef.current?.getBoundingClientRect();
      if (rect) {
        const escapeAngle = Math.atan2(
          rect.height / 2 - mousePositionRef.current.y,
          rect.width / 2 - mousePositionRef.current.x
        ) + Math.PI; // 背离中心
        velocityRef.current = getRandomVelocity(escapeAngle);
      }
    }
  }, [getRandomVelocity]);

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
      
      const escapeSpeed = speed * 4; // 增加逃跑速度
      velocityRef.current = {
        vx: Math.cos(escapeAngle) * escapeSpeed,
        vy: Math.sin(escapeAngle) * escapeSpeed
      };

      setIsEscaping(true);
      behaviorStateRef.current = 'escape_mode'; // 被抓到后进入逃窜状态
      
      if (escapeTimeoutRef.current) {
        clearTimeout(escapeTimeoutRef.current);
      }
      
      escapeTimeoutRef.current = setTimeout(() => {
        setIsEscaping(false);
        behaviorStateRef.current = 'stalking';
        movementPhaseRef.current = 'direct';
        phaseStartTimeRef.current = Date.now();
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
    phaseStartTimeRef.current = Date.now();
    movementPhaseRef.current = 'direct';
  }, [getRandomVelocity]);

  useEffect(() => {
    const animate = () => {
      if (!gameAreaRef.current) return;

      const rect = gameAreaRef.current.getBoundingClientRect();
      const { x, y } = mousePositionRef.current;
      const { vx, vy } = velocityRef.current;
      const now = Date.now();

      // 更新移动模式
      updateMovementPattern();

      // 处理观望状态的暂停
      if (behaviorStateRef.current === 'observing') {
        // 在观望状态下保持位置不变
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      let newX = x + vx;
      let newY = y + vy;

      // 边界碰撞检测，增加更自然的反弹
      // 处理逃窜模式的屏幕退出和重新进入
      if (behaviorStateRef.current === 'escape_mode') {
        // 逃窜模式允许暂时离开屏幕
        if (newX < -100 || newX > rect.width + 100 || newY < -100 || newY > rect.height + 100) {
          // 从相对的边重新进入
          if (newX < -100) newX = rect.width + 50;
          if (newX > rect.width + 100) newX = -50;
          if (newY < -100) newY = rect.height + 50;
          if (newY > rect.height + 100) newY = -50;
          
          // 重新进入后结束逃窜模式
          behaviorStateRef.current = 'stalking';
          movementPhaseRef.current = 'direct';
          phaseStartTimeRef.current = now;
          velocityRef.current = getRandomVelocity();
        }
      } else {
        // 正常边界反弹
        if (newX <= 40 || newX >= rect.width - 40) {
          velocityRef.current.vx = -vx * (0.8 + Math.random() * 0.4);
          newX = Math.max(40, Math.min(rect.width - 40, newX));
          // 边界碰撞时重置为潜行状态
          behaviorStateRef.current = 'stalking';
          movementPhaseRef.current = 'direct';
          phaseStartTimeRef.current = now;
        }

        if (newY <= 40 || newY >= rect.height - 40) {
          velocityRef.current.vy = -vy * (0.8 + Math.random() * 0.4);
          newY = Math.max(40, Math.min(rect.height - 40, newY));
          // 边界碰撞时重置为潜行状态
          behaviorStateRef.current = 'stalking';
          movementPhaseRef.current = 'direct';
          phaseStartTimeRef.current = now;
        }
      }

      // 棕榈轨迹模式已在 updateMovementPattern 中实现，这里只做微调
      if (!isEscaping && movementPhaseRef.current !== 'fake_move') {
        // 根据当前速度调整到目标速度
        const currentSpeed = Math.sqrt(velocityRef.current.vx ** 2 + velocityRef.current.vy ** 2);
        const targetSpeed = getSpeedByBehavior(behaviorStateRef.current);
        
        if (Math.abs(currentSpeed - targetSpeed) > targetSpeed * 0.1) {
          // 平滑调整到目标速度
          const speedRatio = targetSpeed / (currentSpeed || 1);
          velocityRef.current.vx *= speedRatio;
          velocityRef.current.vy *= speedRatio;
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
  }, [speed, isEscaping, updateMovementPattern, getRandomVelocity, getSpeedByBehavior]);

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
        size={70}
        isEscaping={isEscaping}
        isHiding={isHiding}
        behaviorState={behaviorStateRef.current}
      />
      <TouchFeedback touches={touches} />
      <CaptureEffect captures={captures} />
    </div>
  );
};

export default GameArea;