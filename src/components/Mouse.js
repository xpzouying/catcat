import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSpring, animated } from 'react-spring';

const Mouse = ({ x, y, size = 50, isEscaping, velocity = { vx: 0, vy: 0 } }) => {
  const [pulseIntensity, setPulseIntensity] = useState(1);
  
  // 简单的脉动效果
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIntensity(0.95 + Math.random() * 0.1);
    }, 800 + Math.random() * 400);

    return () => clearInterval(interval);
  }, []);

  // Googly eyes physics - 使用react-spring创建物理弹簧效果
  const leftEyeSpring = useSpring({
    from: { x: 0, y: 0 },
    to: {
      x: velocity.vx * 2, // 放大速度影响
      y: velocity.vy * 2
    },
    config: {
      mass: 1,
      tension: 120,
      friction: 14,
    }
  });

  const rightEyeSpring = useSpring({
    from: { x: 0, y: 0 },
    to: {
      x: velocity.vx * 2,
      y: velocity.vy * 2
    },
    config: {
      mass: 1.2, // 右眼稍重，产生不同步效果
      tension: 100,
      friction: 12,
    }
  });

  // 瞳孔的物理模拟 - 更强的惯性
  const leftPupilSpring = useSpring({
    from: { x: 0, y: 0 },
    to: {
      x: velocity.vx * 5, // 瞳孔移动更夸张
      y: velocity.vy * 5
    },
    config: {
      mass: 0.5,
      tension: 60,
      friction: 8,
    }
  });

  const rightPupilSpring = useSpring({
    from: { x: 0, y: 0 },
    to: {
      x: velocity.vx * 5,
      y: velocity.vy * 5
    },
    config: {
      mass: 0.6,
      tension: 50,
      friction: 7,
    }
  });

  return (
    <>
      {/* 主体 */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: '#FFD24A',
          boxShadow: '0 0 15px rgba(255, 210, 74, 0.6)',
          border: '2px solid #ffffff',
          zIndex: 10,
        }}
        animate={{
          x: x - size/2,
          y: y - size/2,
          scale: isEscaping ? 1.2 : pulseIntensity,
        }}
        transition={{
          x: { type: "spring", stiffness: isEscaping ? 400 : 100, damping: isEscaping ? 15 : 20 },
          y: { type: "spring", stiffness: isEscaping ? 400 : 100, damping: isEscaping ? 15 : 20 },
          scale: { type: "spring", stiffness: 300, damping: 20 },
        }}
      />
      
      {/* 左眼睛 - 使用react-spring */}
      <animated.div
        className="absolute rounded-full bg-white"
        style={{
          width: size * 0.3,
          height: size * 0.3,
          left: x - size * 0.22,
          top: y - size * 0.18,
          transform: leftEyeSpring.x.to(
            (xVal) => `translate(${xVal}px, ${leftEyeSpring.y.get()}px)`
          ),
          zIndex: 11,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        {/* 左瞳孔 - 使用react-spring */}
        <animated.div
          className="absolute rounded-full bg-black"
          style={{
            width: size * 0.12,
            height: size * 0.12,
            left: '50%',
            top: '50%',
            marginLeft: -(size * 0.06),
            marginTop: -(size * 0.06),
            transform: leftPupilSpring.x.to(
              (xVal) => {
                // 限制瞳孔在眼白内移动
                const maxOffset = size * 0.08;
                const clampedX = Math.max(-maxOffset, Math.min(maxOffset, xVal));
                const clampedY = Math.max(-maxOffset, Math.min(maxOffset, leftPupilSpring.y.get()));
                return `translate(${clampedX}px, ${clampedY}px)`;
              }
            ),
          }}
        >
          {/* 瞳孔高光 */}
          <div 
            className="absolute bg-white rounded-full"
            style={{
              width: size * 0.03,
              height: size * 0.03,
              left: '25%',
              top: '25%',
            }}
          />
        </animated.div>
      </animated.div>
      
      {/* 右眼睛 - 使用react-spring */}
      <animated.div
        className="absolute rounded-full bg-white"
        style={{
          width: size * 0.3,
          height: size * 0.3,
          left: x + size * 0.02,
          top: y - size * 0.18,
          transform: rightEyeSpring.x.to(
            (xVal) => `translate(${xVal}px, ${rightEyeSpring.y.get()}px)`
          ),
          zIndex: 11,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        {/* 右瞳孔 - 使用react-spring */}
        <animated.div
          className="absolute rounded-full bg-black"
          style={{
            width: size * 0.12,
            height: size * 0.12,
            left: '50%',
            top: '50%',
            marginLeft: -(size * 0.06),
            marginTop: -(size * 0.06),
            transform: rightPupilSpring.x.to(
              (xVal) => {
                // 限制瞳孔在眼白内移动
                const maxOffset = size * 0.08;
                const clampedX = Math.max(-maxOffset, Math.min(maxOffset, xVal));
                const clampedY = Math.max(-maxOffset, Math.min(maxOffset, rightPupilSpring.y.get()));
                return `translate(${clampedX}px, ${clampedY}px)`;
              }
            ),
          }}
        >
          {/* 瞳孔高光 */}
          <div 
            className="absolute bg-white rounded-full"
            style={{
              width: size * 0.03,
              height: size * 0.03,
              left: '25%',
              top: '25%',
            }}
          />
        </animated.div>
      </animated.div>

      {/* 添加眉毛增加表情 */}
      {isEscaping && (
        <>
          <motion.div
            className="absolute bg-gray-800"
            style={{
              width: size * 0.25,
              height: size * 0.04,
              left: x - size * 0.25,
              top: y - size * 0.35,
              borderRadius: '2px',
              transform: 'rotate(-15deg)',
            }}
            animate={{
              y: [0, -2, 0],
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="absolute bg-gray-800"
            style={{
              width: size * 0.25,
              height: size * 0.04,
              left: x + size * 0.05,
              top: y - size * 0.35,
              borderRadius: '2px',
              transform: 'rotate(15deg)',
            }}
            animate={{
              y: [0, -2, 0],
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
            }}
          />
        </>
      )}
    </>
  );
};

export default Mouse;