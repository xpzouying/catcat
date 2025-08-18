import React from 'react';
import { motion } from 'framer-motion';

const Mouse = ({ x, y, size = 25, isEscaping }) => {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: '#4A90E2',
        boxShadow: '0 0 10px rgba(74, 144, 226, 0.5)',
      }}
      animate={{
        x,
        y,
        scale: isEscaping ? [1, 1.2, 1] : 1,
      }}
      transition={{
        type: "spring",
        stiffness: isEscaping ? 500 : 100,
        damping: isEscaping ? 10 : 20,
      }}
    />
  );
};

export default Mouse;