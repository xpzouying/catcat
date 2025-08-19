import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RainbowTrail = ({ mousePosition, isEscaping, speed }) => {
  const [trail, setTrail] = useState([]);
  const trailLength = isEscaping ? 15 : 10; // 逃跑时尾巴更长
  
  // 彩虹颜色序列
  const rainbowColors = [
    '#FF0000', // 红
    '#FF7F00', // 橙
    '#FFFF00', // 黄
    '#00FF00', // 绿
    '#0000FF', // 蓝
    '#4B0082', // 靛
    '#9400D3', // 紫
  ];

  // 更新轨迹
  useEffect(() => {
    const newTrailPoint = {
      x: mousePosition.x,
      y: mousePosition.y,
      id: Date.now(),
      timestamp: Date.now()
    };

    setTrail(prevTrail => {
      const updatedTrail = [newTrailPoint, ...prevTrail];
      // 保持轨迹长度
      return updatedTrail.slice(0, trailLength);
    });

    // 清理老旧的轨迹点
    const cleanup = setTimeout(() => {
      setTrail(prevTrail => 
        prevTrail.filter(point => 
          Date.now() - point.timestamp < 1000
        )
      );
    }, 1000);

    return () => clearTimeout(cleanup);
  }, [mousePosition, trailLength]);

  return (
    <AnimatePresence>
      {trail.map((point, index) => {
        const progress = index / trailLength;
        const colorIndex = Math.floor((index / trailLength) * rainbowColors.length);
        const color = rainbowColors[colorIndex % rainbowColors.length];
        
        // 尺寸渐变 - 从大到小
        const size = 30 * (1 - progress * 0.8); // 30px 到 6px
        
        // 透明度渐变
        const opacity = 1 - progress * 0.7;
        
        // 波浪效果
        const waveOffset = Math.sin(Date.now() / 200 + index * 0.5) * 5;
        
        return (
          <motion.div
            key={point.id}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size * 1.5, // 矩形化，更像彩虹条
              backgroundColor: color,
              boxShadow: `0 0 ${10 + (isEscaping ? 10 : 0)}px ${color}`,
              filter: 'blur(0.5px)',
              zIndex: 5 - index, // 确保新的在上面
            }}
            initial={{ 
              x: point.x - size/2,
              y: point.y - size/2 + waveOffset,
              opacity: opacity,
              scale: 0.5
            }}
            animate={{ 
              x: point.x - size/2,
              y: point.y - size/2 + waveOffset,
              opacity: opacity,
              scale: 1
            }}
            exit={{ 
              opacity: 0,
              scale: 0.5,
              transition: { duration: 0.5 }
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
          />
        );
      })}
      
      {/* 星星粒子效果 */}
      {isEscaping && trail.slice(0, 3).map((point, index) => (
        <motion.div
          key={`star-${point.id}`}
          className="absolute"
          style={{
            width: 0,
            height: 0,
            borderLeft: '3px solid transparent',
            borderRight: '3px solid transparent',
            borderBottom: `6px solid ${rainbowColors[index % rainbowColors.length]}`,
            filter: 'brightness(1.5)',
            zIndex: 10,
          }}
          initial={{ 
            x: point.x + Math.random() * 20 - 10,
            y: point.y + Math.random() * 20 - 10,
            opacity: 1,
            rotate: Math.random() * 360
          }}
          animate={{ 
            x: point.x + Math.random() * 40 - 20,
            y: point.y + Math.random() * 40 - 20,
            opacity: 0,
            rotate: Math.random() * 720
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* 彩虹光晕效果 */}
      {trail[0] && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 60,
            height: 60,
            background: `radial-gradient(circle, 
              ${rainbowColors[0]}33 0%, 
              ${rainbowColors[2]}22 30%, 
              ${rainbowColors[4]}11 60%, 
              transparent 70%)`,
            filter: 'blur(10px)',
            zIndex: 3,
          }}
          animate={{
            x: trail[0].x - 30,
            y: trail[0].y - 30,
            scale: isEscaping ? [1, 1.5, 1] : 1,
          }}
          transition={{
            scale: {
              duration: 0.5,
              repeat: isEscaping ? Infinity : 0,
              repeatType: "reverse"
            }
          }}
        />
      )}
    </AnimatePresence>
  );
};

export default RainbowTrail;