import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Mouse = ({ x, y, size = 40, isEscaping, isHiding, behaviorState = 'exploring' }) => {
  const [pulseIntensity, setPulseIntensity] = useState(1);
  
  // 根据行为状态设置视觉效果
  useEffect(() => {
    const interval = setInterval(() => {
      switch(behaviorState) {
        case 'hunting':
          setPulseIntensity(1.1 + Math.random() * 0.2);
          break;
        case 'resting':
          setPulseIntensity(0.9 + Math.random() * 0.1);
          break;
        case 'hiding':
          setPulseIntensity(0.7);
          break;
        default:
          setPulseIntensity(1 + Math.random() * 0.1);
      }
    }, 500 + Math.random() * 1000);

    return () => clearInterval(interval);
  }, [behaviorState]);

  const getMouseColor = () => {
    // 统一使用明黄色 #FFD24A，与深色背景形成强对比
    return '#FFD24A';
  };

  return (
    <>
      {/* 主体 */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: getMouseColor(),
          boxShadow: `0 0 ${isEscaping ? 20 : 15}px ${getMouseColor()}80`,
          opacity: isHiding ? 0.3 : 1,
          border: '2px solid #ffffff', // 白色描边增强边缘
        }}
        animate={{
          x: x - size/2,
          y: y - size/2,
          scale: isEscaping ? 1.3 : pulseIntensity,
        }}
        transition={{
          x: { type: "spring", stiffness: isEscaping ? 500 : 150, damping: isEscaping ? 10 : 25 },
          y: { type: "spring", stiffness: isEscaping ? 500 : 150, damping: isEscaping ? 10 : 25 },
          scale: { type: "tween", duration: isEscaping ? 0.15 : 0.8, ease: "easeOut" },
          opacity: { duration: 0.3 },
        }}
      />
      
      {/* 尾迹效果 */}
      {isEscaping && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: size * 0.7,
            height: size * 0.7,
            backgroundColor: getMouseColor(),
            opacity: 0.4,
          }}
          animate={{
            x: x - (size * 0.7)/2,
            y: y - (size * 0.7)/2,
            scale: [0.8, 1.2, 0.6],
          }}
          transition={{
            x: { type: "spring", stiffness: 300, damping: 20, delay: 0.1 },
            y: { type: "spring", stiffness: 300, damping: 20, delay: 0.1 },
            scale: { duration: 0.4, times: [0, 0.5, 1] },
          }}
        />
      )}
      
      {/* 眼睛效果 */}
      {!isHiding && (
        <>
          <motion.div
            className="absolute rounded-full bg-white"
            style={{
              width: size * 0.2,
              height: size * 0.2,
            }}
            animate={{
              x: x - size * 0.15,
              y: y - size * 0.1,
            }}
            transition={{
              x: { type: "spring", stiffness: isEscaping ? 200 : 80, damping: isEscaping ? 15 : 20, delay: isEscaping ? 0.1 : 0.05 },
              y: { type: "spring", stiffness: isEscaping ? 200 : 80, damping: isEscaping ? 15 : 20, delay: isEscaping ? 0.1 : 0.05 },
            }}
          >
            {/* 瞳孔 - 拖拽更明显 */}
            <motion.div
              className="absolute rounded-full bg-black"
              style={{
                width: size * 0.08,
                height: size * 0.08,
                left: '30%',
                top: '30%',
              }}
              animate={{
                x: 0,
                y: 0,
              }}
              transition={{
                x: { type: "spring", stiffness: isEscaping ? 100 : 50, damping: isEscaping ? 10 : 15, delay: isEscaping ? 0.15 : 0.08 },
                y: { type: "spring", stiffness: isEscaping ? 100 : 50, damping: isEscaping ? 10 : 15, delay: isEscaping ? 0.15 : 0.08 },
              }}
            />
          </motion.div>
          <motion.div
            className="absolute rounded-full bg-white"
            style={{
              width: size * 0.2,
              height: size * 0.2,
            }}
            animate={{
              x: x + size * 0.05,
              y: y - size * 0.1,
            }}
            transition={{
              x: { type: "spring", stiffness: isEscaping ? 200 : 80, damping: isEscaping ? 15 : 20, delay: isEscaping ? 0.12 : 0.06 },
              y: { type: "spring", stiffness: isEscaping ? 200 : 80, damping: isEscaping ? 15 : 20, delay: isEscaping ? 0.12 : 0.06 },
            }}
          >
            {/* 瞳孔 - 拖拽更明显 */}
            <motion.div
              className="absolute rounded-full bg-black"
              style={{
                width: size * 0.08,
                height: size * 0.08,
                left: '30%',
                top: '30%',
              }}
              animate={{
                x: 0,
                y: 0,
              }}
              transition={{
                x: { type: "spring", stiffness: isEscaping ? 100 : 50, damping: isEscaping ? 10 : 15, delay: isEscaping ? 0.18 : 0.09 },
                y: { type: "spring", stiffness: isEscaping ? 100 : 50, damping: isEscaping ? 10 : 15, delay: isEscaping ? 0.18 : 0.09 },
              }}
            />
          </motion.div>
        </>
      )}
    </>
  );
};

export default Mouse;