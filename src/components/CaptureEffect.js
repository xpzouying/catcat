import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CaptureEffect = ({ captures }) => {
  return (
    <AnimatePresence>
      {captures.map((capture, index) => (
        <motion.div
          key={`capture-${capture.id}-${index}`}
          className="absolute pointer-events-none"
          style={{
            left: capture.x - 50,
            top: capture.y - 50,
            width: 100,
            height: 100,
          }}
          initial={{ 
            scale: 0,
            opacity: 1,
          }}
          animate={{ 
            scale: [0, 1.2, 1.5],
            opacity: [1, 0.8, 0],
          }}
          exit={{ 
            scale: 2, 
            opacity: 0,
          }}
          transition={{ 
            duration: 0.8,
            times: [0, 0.3, 1],
            ease: "easeOut",
          }}
        >
          {/* 主爆炸效果 */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, #FFD700, #FFA500, transparent 60%)',
              border: '3px solid #FFD700',
            }}
            animate={{
              scale: [0.8, 1.3, 1.8],
              opacity: [0.9, 0.6, 0],
            }}
            transition={{
              duration: 0.8,
              times: [0, 0.4, 1],
              ease: "easeOut",
            }}
          />
          
          {/* 火花效果 */}
          {[...Array(8)].map((_, sparkIndex) => (
            <motion.div
              key={`spark-${sparkIndex}`}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              style={{
                left: 50,
                top: 50,
              }}
              animate={{
                x: Math.cos(sparkIndex * Math.PI / 4) * (30 + Math.random() * 40),
                y: Math.sin(sparkIndex * Math.PI / 4) * (30 + Math.random() * 40),
                scale: [1, 0.8, 0],
                opacity: [1, 0.7, 0],
              }}
              transition={{
                duration: 0.6 + Math.random() * 0.4,
                ease: "easeOut",
              }}
            />
          ))}
          
          {/* 成功文字提示 */}
          <motion.div
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
            animate={{
              scale: [0.5, 1.2, 0.8],
              y: [0, -20, -40],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.2,
              times: [0, 0.3, 1],
              ease: "easeOut",
            }}
          >
            <span className="text-2xl font-bold text-yellow-600">
              ✨ 抓到了! ✨
            </span>
          </motion.div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
};

export default CaptureEffect;