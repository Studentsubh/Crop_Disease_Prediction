import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Leaf, ShieldCheck, AlertTriangle } from 'lucide-react'

export default function ResultCard({ result, fileName }) {
  const { class_display, crop, confidence, is_healthy } = result
  const [tickingConf, setTickingConf] = useState(0)

  // Ticking number animation for confidence percentage
  useEffect(() => {
    let start = 0
    const end = Math.round(confidence * 100)
    if (start === end) {
      setTickingConf(end)
      return
    }

    const duration = 800 // total animation time in ms
    const intervalTime = 16 // ~60 fps
    const steps = duration / intervalTime
    const increment = end / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setTickingConf(end)
        clearInterval(timer)
      } else {
        setTickingConf(Math.floor(current))
      }
    }, intervalTime)

    return () => clearInterval(timer)
  }, [confidence])

  // Color mappings based on healthy vs diseased
  const accentClass = is_healthy ? 'text-lab-sage' : 'text-lab-rust'
  const bgAccentClass = is_healthy ? 'bg-lab-sage/10' : 'bg-lab-rust/10'
  const borderAccentClass = is_healthy ? 'border-lab-sage/30' : 'border-lab-rust/30'
  const fillBarClass = is_healthy ? 'bg-lab-sage' : 'bg-lab-rust'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-lab-surface/60 border ${borderAccentClass} rounded-lg p-4 relative overflow-hidden shadow-sm`}
    >
      {/* Small tech corner elements */}
      <div className={`absolute top-0 right-0 w-8 h-8 ${bgAccentClass} flex items-center justify-center border-l border-b ${borderAccentClass} rounded-bl`}>
        {is_healthy ? (
          <ShieldCheck className="w-4 h-4 text-lab-sage" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-lab-rust" />
        )}
      </div>

      {/* File Identifier */}
      <div className="font-mono text-[9px] text-lab-text-muted mb-2 truncate max-w-[80%]">
        SPECIMEN_ID: {fileName || "UNKNOWN_FILE"}
      </div>

      {/* Main Diagnosis */}
      <div className="mb-4 pr-6">
        <span className="font-mono text-[10px] uppercase text-lab-text-muted block mb-0.5">
          DIAGNOSTIC_READOUT:
        </span>
        <h4 className="font-display text-lg font-medium text-lab-text-primary leading-snug">
          {class_display}
        </h4>
      </div>

      {/* Info Badges */}
      <div className="flex gap-2 mb-4">
        {/* Crop Tag */}
        <span className="font-mono text-[9px] uppercase tracking-wider bg-lab-bg border border-lab-sage/15 px-2 py-0.5 rounded flex items-center gap-1">
          <Leaf className="w-2.5 h-2.5 text-lab-sage" />
          {crop}
        </span>
        
        {/* Healthy / Pathogen Tag */}
        <span className={`font-mono text-[9px] uppercase tracking-wider ${bgAccentClass} border ${borderAccentClass} px-2 py-0.5 rounded`}>
          {is_healthy ? "HEALTHY_SPECIMEN" : "PATHOGEN_DETECTED"}
        </span>
      </div>

      {/* Confidence Score Ticker and Bar */}
      <div className="space-y-1.5 pt-2 border-t border-lab-sage/10">
        <div className="flex justify-between items-center font-mono text-[10px]">
          <span className="text-lab-text-muted">CONFIDENCE_SCORE:</span>
          <span className={`${accentClass} font-bold`}>{tickingConf}%</span>
        </div>
        
        {/* Thin Animated Bar */}
        <div className="w-full h-1 bg-lab-bg rounded overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${tickingConf}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full ${fillBarClass}`}
          />
        </div>
      </div>
    </motion.div>
  )
}
