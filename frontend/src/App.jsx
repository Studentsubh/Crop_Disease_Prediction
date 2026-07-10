import React, { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import LandingPage from './pages/LandingPage'
import PredictPage from './pages/PredictPage'

export default function App() {
  const [page, setPage] = useState('landing')

  return (
    <div className="min-h-screen bg-lab-bg text-lab-text-primary lab-grid-bg relative flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Header element */}
      <header className="border-b border-lab-sage/10 py-4 px-6 md:px-12 flex justify-between items-center bg-lab-bg/85 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-lab-gold/50 flex items-center justify-center bg-lab-surface">
            <span className="font-mono text-xs text-lab-gold font-bold">C-D</span>
          </div>
          <div>
            <h1 className="font-display text-sm tracking-wide font-medium uppercase text-lab-text-primary">
              SPECIMEN LAB
            </h1>
            <p className="font-mono text-[9px] text-lab-text-muted uppercase leading-none">
              crop disease detection • v1.0.0
            </p>
          </div>
        </div>
        
        {page === 'predict' && (
          <button
            onClick={() => setPage('landing')}
            className="font-mono text-xs text-lab-gold hover:text-lab-text-primary border border-lab-gold/20 hover:border-lab-gold px-3 py-1.5 rounded transition duration-200"
            aria-label="Back to landing page"
          >
            // RETURN_TO_HOME
          </button>
        )}
      </header>

      {/* Main Page Area */}
      <main className="flex-grow flex items-center justify-center p-4 md:p-8 z-10">
        <AnimatePresence mode="wait">
          {page === 'landing' ? (
            <LandingPage key="landing" onDiagnose={() => setPage('predict')} />
          ) : (
            <PredictPage key="predict" onBack={() => setPage('landing')} />
          )}
        </AnimatePresence>
      </main>

      {/* Footer element */}
      <footer className="border-t border-lab-sage/10 py-3 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-2 bg-lab-surface/30 z-20">
        <div className="flex gap-4 items-center font-mono text-[10px] text-lab-text-muted">
          <span>STATUS: <span className="text-lab-sage animate-pulse">ONLINE</span></span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">SYSTEM: INTEL_ACTIVE</span>
        </div>
        <p className="font-mono text-[10px] text-lab-text-muted">
          © {new Date().getFullYear()} BOTANIST DIAGNOSTICS GROUP
        </p>
      </footer>
    </div>
  )
}
