import React from "react";
import { motion } from "framer-motion";

interface BlurRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const BlurReveal: React.FC<BlurRevealProps> = ({
  children,
  delay = 0,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(8px)", y: 10 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
