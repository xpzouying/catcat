import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TouchFeedback = ({ touches }) => {
  return (
    <AnimatePresence>
      {touches.map((touch, index) => (
        <motion.div
          key={`touch-${touch.id}-${index}`}
          className="absolute pointer-events-none"
          style={{
            left: touch.x - 30,
            top: touch.y - 30,
            width: 60,
            height: 60,
            borderRadius: '50%',
            border: '3px solid rgba(255, 255, 255, 0.6)',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
          }}
          initial={{ 
            scale: 0.5, 
            opacity: 0.8,
          }}
          animate={{ 
            scale: touch.hit ? 1.5 : 1.2,
            opacity: touch.hit ? 0.9 : 0.4,
          }}
          exit={{ 
            scale: 2, 
            opacity: 0,
          }}
          transition={{ 
            duration: 0.6,
            ease: "easeOut",
          }}
        />
      ))}
    </AnimatePresence>
  );
};

export default TouchFeedback;