import React from 'react'
import { motion } from 'framer-motion'
import { Scan, Sprout } from 'lucide-react'

export default function LandingPage({ onDiagnose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-xl"
    >
      {/* Morphable Specimen Card */}
      <motion.div
        layoutId="diagnostic-container"
        transition={{ type: "spring", stiffness: 180, damping: 24 }}
        className="bg-lab-surface border border-lab-sage/20 rounded-lg p-6 md:p-10 shadow-lab-glow relative overflow-hidden flex flex-col justify-between"
      >
        {/* Lab styling details */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-lab-gold"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-lab-gold"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-lab-gold"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-lab-gold"></div>

        {/* Technical Top Header */}
        <div className="flex justify-between items-center mb-8 border-b border-lab-sage/10 pb-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-lab-sage" />
            <span className="font-mono text-[10px] tracking-wider uppercase text-lab-text-muted">
              DIAGNOSTIC INSTRUMENT // C-D-14
            </span>
          </div>
          <span className="font-mono text-[10px] text-lab-gold bg-lab-gold/5 px-2 py-0.5 rounded border border-lab-gold/15">
            READY
          </span>
        </div>

        {/* Main Content */}
        <div className="my-4">
          <h2 className="font-display text-4xl md:text-5xl text-lab-text-primary font-normal leading-tight mb-4">
            Crop disease, <br />
            <span className="text-lab-gold italic">diagnosed</span> from a photo.
          </h2>
          <p className="text-sm md:text-base text-lab-text-muted font-sans leading-relaxed max-w-md">
            Tomato and corn today. More crops as the model grows. Upload a single leaf or a batch of leaves to run instantaneous neural network diagnostics.
          </p>
        </div>

        {/* CTA Area */}
        <div className="mt-8 pt-6 border-t border-lab-sage/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="font-mono text-[9px] text-lab-text-muted leading-tight">
            ACCURACY: 94.3% [MobileNetV2]<br />
            CLASSES: 14 PATHOGENS/HEALTHY
          </div>
          
          <motion.button
            layoutId="action-btn"
            onClick={onDiagnose}
            className="group flex items-center justify-center gap-3 bg-lab-gold hover:bg-lab-text-primary text-lab-bg font-sans font-semibold px-6 py-3 rounded shadow-md transition-colors duration-300"
            aria-label="Diagnose a leaf"
          >
            <Scan className="w-4 h-4 text-lab-bg group-hover:scale-110 transition-transform duration-200" />
            <span>DIAGNOSE A LEAF</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
