import React from 'react'
import { motion } from 'framer-motion'

export default function ScanLineAnimation() {
  return (
    <div className="absolute inset-0 bg-lab-bg/40 backdrop-blur-[1px] overflow-hidden pointer-events-none rounded">
      {/* The scanning sweep line */}
      <motion.div
        initial={{ top: "0%" }}
        animate={{ top: "100%" }}
        transition={{
          repeat: Infinity,
          repeatType: "reverse",
          duration: 1.8,
          ease: "easeInOut"
        }}
        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-lab-gold to-transparent shadow-[0_0_10px_#C9A227] z-10"
      />
      
      {/* Subtle diagnostic grid overlay */}
      <div className="absolute inset-0 opacity-15 bg-[linear-gradient(rgba(201,162,39,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(201,162,39,0.1)_1px,transparent_1px)] bg-[size:10px_10px]"></div>
      
      {/* Technical Scanning Text */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center bg-lab-surface/80 border border-lab-gold/30 px-2 py-1 rounded">
        <span className="font-mono text-[9px] text-lab-gold animate-pulse tracking-wider">
          SCANNING_SPECIMEN...
        </span>
        <span className="font-mono text-[9px] text-lab-gold">
          SYS_INFERENCE_FLIGHT
        </span>
      </div>
    </div>
  )
}
