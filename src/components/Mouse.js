import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const Mouse = ({ x, y, size = 50, isEscaping, velocity = { vx: 0, vy: 0 } }) => {
  const [pulseIntensity, setPulseIntensity] = useState(1);
  const prevPosition = useRef({ x: x, y: y });
  
  // 简单的脉动效果
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIntensity(0.95 + Math.random() * 0.1); // 轻微脉动
    }, 800 + Math.random() * 400);

    return () => clearInterval(interval);
  }, []);

  // 更新上一帧位置
  useEffect(() => {
    prevPosition.current = { x, y };
  }, [x, y]);

  // 计算眼睛朝向，基于移动方向
  const getEyeDirection = () => {
    const dx = velocity.vx;
    const dy = velocity.vy;
    const speed = Math.sqrt(dx * dx + dy * dy);
    
    // 如果移动速度很慢，眼睛居中
    if (speed < 0.5) {
      return { offsetX: 0, offsetY: 0 };
    }
    
    // 根据移动方向偏移眼睛
    const maxOffset = size * 0.03; // 减小偏移量
    return {
      offsetX: (dx / speed) * maxOffset,
      offsetY: (dy / speed) * maxOffset
    };
  };

  const eyeDirection = getEyeDirection();

  return (
    <>
      {/* 主体 - 回到简单设计 */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: '#FFD24A',
          boxShadow: '0 0 15px rgba(255, 210, 74, 0.6)',
          border: '2px solid #ffffff',
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
      
      {/* 左眼睛 - 简化并跟随移动方向 */}
      <motion.div
        className="absolute rounded-full bg-white"
        style={{
          width: size * 0.25,
          height: size * 0.25,
        }}
        animate={{
          x: x - size * 0.2,
          y: y - size * 0.15,
        }}
        transition={{
          type: "spring",
          stiffness: isEscaping ? 300 : 120,
          damping: isEscaping ? 15 : 25,
          delay: 0.02 // 轻微延迟产生拖拽效果
        }}
      >
        {/* 左瞳孔 */}
        <motion.div
          className="absolute rounded-full bg-black"
          style={{
            width: size * 0.1,
            height: size * 0.1,
            left: '50%',
            top: '50%',
            marginLeft: -(size * 0.05),
            marginTop: -(size * 0.05),
          }}
          animate={{
            x: eyeDirection.offsetX,
            y: eyeDirection.offsetY,
          }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 20,
            delay: 0.05 // 瞳孔延迟更明显
          }}
        />
      </motion.div>
      
      {/* 右眼睛 */}
      <motion.div
        className="absolute rounded-full bg-white"
        style={{
          width: size * 0.25,
          height: size * 0.25,
        }}
        animate={{
          x: x + size * 0.05,
          y: y - size * 0.15,
        }}
        transition={{
          type: "spring",
          stiffness: isEscaping ? 300 : 120,
          damping: isEscaping ? 15 : 25,
          delay: 0.025 // 稍微不同的延迟
        }}
      >
        {/* 右瞳孔 */}
        <motion.div
          className="absolute rounded-full bg-black"
          style={{
            width: size * 0.1,
            height: size * 0.1,
            left: '50%',
            top: '50%',
            marginLeft: -(size * 0.05),
            marginTop: -(size * 0.05),
          }}
          animate={{
            x: eyeDirection.offsetX,
            y: eyeDirection.offsetY,
          }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 20,
            delay: 0.055 // 右瞳孔延迟稍微不同
          }}
        />
      </motion.div>
    </>
  );
};

export default Mouse;