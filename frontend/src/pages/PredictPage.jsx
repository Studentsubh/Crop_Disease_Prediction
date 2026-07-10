import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UploadCloud, Image as ImageIcon, X, AlertOctagon, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react'
import ScanLineAnimation from '../components/ScanLineAnimation'
import ResultCard from '../components/ResultCard'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function PredictPage({ onBack }) {
  const [files, setFiles] = useState([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showWakeupWarning, setShowWakeupWarning] = useState(false)
  const [globalError, setGlobalError] = useState(null)
  const [history, setHistory] = useState([])
  const [supabaseConnected, setSupabaseConnected] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  
  const fileInputRef = useRef(null)
  const wakeupTimerRef = useRef(null)

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/predictions/`)
      if (response.ok) {
        const data = await response.json()
        setHistory(data.results || [])
        setSupabaseConnected(data.supabase_connected || false)
      }
    } catch (e) {
      console.error("Failed to load history:", e)
    }
  }

  const handleSelectRecord = (record) => {
    // Toggle selection
    setSelectedRecord(prev => (prev && prev.id === record.id) ? null : record)
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  // Clean up Object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      files.forEach(f => URL.revokeObjectURL(f.previewUrl))
    }
  }, [])

  // Trigger waking up notice if API is taking more than 2 seconds (Render cold start)
  useEffect(() => {
    if (isSubmitting) {
      wakeupTimerRef.current = setTimeout(() => {
        setShowWakeupWarning(true)
      }, 2000)
    } else {
      if (wakeupTimerRef.current) clearTimeout(wakeupTimerRef.current)
      setShowWakeupWarning(false)
    }
    return () => {
      if (wakeupTimerRef.current) clearTimeout(wakeupTimerRef.current)
    }
  }, [isSubmitting])

  const processFiles = (newFiles) => {
    setGlobalError(null)
    const validFiles = []
    
    Array.from(newFiles).forEach(file => {
      // Server-side matches 10MB limit
      const maxSizeBytes = 10 * 1024 * 1024 
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
      
      if (file.size > maxSizeBytes) {
        setGlobalError(`Couldn't read "${file.name}" — File size exceeds 10MB limit.`)
        return
      }
      
      if (!allowedTypes.includes(file.type)) {
        setGlobalError(`Couldn't read "${file.name}" — Only JPG or PNG formats are supported.`)
        return
      }

      validFiles.push({
        id: Math.random().toString(36).substring(2, 9),
        file: file,
        previewUrl: URL.createObjectURL(file),
        status: 'idle', // idle | scanning | done | error
        result: null,
        error: null
      })
    })

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files)
    }
  }

  const triggerFilePicker = (event) => {
    event.preventDefault()
    event.stopPropagation()
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e) => {
    if (e.target.files) {
      processFiles(e.target.files)
      e.target.value = ''
    }
  }

  const removeFile = (idToRemove) => {
    setFiles(prev => {
      const fileToClear = prev.find(f => f.id === idToRemove)
      if (fileToClear) URL.revokeObjectURL(fileToClear.previewUrl)
      return prev.filter(f => f.id !== idToRemove)
    })
  }

  const resetAll = () => {
    files.forEach(f => URL.revokeObjectURL(f.previewUrl))
    setFiles([])
    setIsSubmitting(false)
    setGlobalError(null)
    setShowWakeupWarning(false)
  }

  const runDiagnostics = async () => {
    if (files.length === 0 || isSubmitting) return
    setIsSubmitting(true)
    setGlobalError(null)

    // Set all idle files to 'scanning'
    setFiles(prev => prev.map(f => f.status === 'idle' ? { ...f, status: 'scanning' } : f))

    // Process all files concurrently
    const diagnosticPromises = files.map(async (fileObj) => {
      if (fileObj.status !== 'idle' && fileObj.status !== 'error') return

      const formData = new FormData()
      formData.append('image', fileObj.file)

      try {
        const response = await fetch(`${API_URL}/api/predict/`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          throw new Error(errData.error || `Server responded with ${response.status}`)
        }

        const data = await response.json()

        // If confidence is present and below 90%, treat as an error
        const conf = Number(data.confidence ?? -1)
        if (!isNaN(conf) && conf < 0.9) {
          const pct = Math.round(conf * 100)
          const warningMessage = data.warning || `Low confidence (${pct}%). Try a clearer photo or different angle.`
          setFiles(prev => prev.map(f => f.id === fileObj.id ? {
            ...f,
            status: 'error',
            error: warningMessage
          } : f))
        } else {
          // Update this file state to 'done'
          setFiles(prev => prev.map(f => f.id === fileObj.id ? {
            ...f,
            status: 'done',
            result: data
          } : f))
        }

      } catch (error) {
        // Update this file state to 'error'
        setFiles(prev => prev.map(f => f.id === fileObj.id ? {
          ...f,
          status: 'error',
          error: error.message || 'Diagnostic request failed'
        } : f))
      }
    })

    await Promise.all(diagnosticPromises)
    setIsSubmitting(false)
    fetchHistory()
  }

  const allDone = files.length > 0 && files.every(f => f.status === 'done' || f.status === 'error')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-4xl"
    >
      {/* Single hidden file input mounted once so programmatic .click() always works */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFileSelect}
      />
      <motion.div
        layoutId="diagnostic-container"
        transition={{ type: "spring", stiffness: 180, damping: 24 }}
        className="bg-lab-surface border border-lab-sage/20 rounded-lg p-6 md:p-8 shadow-lab-glow relative overflow-hidden"
      >
        {/* Lab corner boundaries */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-lab-gold"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-lab-gold"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-lab-gold"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-lab-gold"></div>

        {/* Technical Header */}
        <div className="flex justify-between items-center mb-6 border-b border-lab-sage/10 pb-4">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-lab-gold">
            SPECIMEN ANALYSIS CHAMBER
          </h2>
          <div className="flex gap-2 font-mono text-[9px] text-lab-text-muted">
            <span>BATCH_SIZE: {files.length}</span>
            <span>•</span>
            <span>ACTIVE_INFERENCES: {files.filter(f => f.status === 'scanning').length}</span>
          </div>
        </div>

        {/* Global Error Notice */}
        {globalError && (
          <div className="mb-4 bg-lab-rust/10 border border-lab-rust/30 rounded p-3 flex gap-3 items-center">
            <AlertOctagon className="w-5 h-5 text-lab-rust flex-shrink-0" />
            <span className="font-mono text-xs text-lab-rust">{globalError}</span>
          </div>
        )}

        {/* Waking Up Model Warning Notice */}
        {showWakeupWarning && (
          <div className="mb-4 bg-lab-gold/10 border border-lab-gold/30 rounded p-3 flex gap-3 items-center animate-pulse">
            <AlertTriangle className="w-5 h-5 text-lab-gold flex-shrink-0" />
            <div>
              <p className="font-mono text-xs text-lab-gold font-semibold uppercase">
                DIAGNOSTIC ENGINE WAKING UP...
              </p>
              <p className="font-mono text-[10px] text-lab-text-muted mt-0.5">
                The inference backend runs on a free tier service. Starting up the container model may take 30-50 seconds. Thank you for your patience.
              </p>
            </div>
          </div>
        )}

        {/* Empty Dropzone State */}
        {files.length === 0 && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-10 md:p-16 flex flex-col items-center justify-center transition duration-200 ${
              isDragOver
                ? 'border-lab-gold bg-lab-gold/5'
                : 'border-lab-sage/20 hover:border-lab-gold/50 bg-lab-bg/50'
            }`}
          >
            <UploadCloud className="w-12 h-12 text-lab-text-muted mb-4" />
            <p className="font-sans text-sm text-lab-text-primary text-center font-medium">
              Drag & drop specimen leaf photos here, or{' '}
              <button
                type="button"
                onClick={triggerFilePicker}
                className="text-lab-gold hover:underline font-semibold focus:outline-none"
              >
                browse local files
              </button>
            </p>
            <p className="font-mono text-[9px] text-lab-text-muted mt-2 uppercase">
              Supports Tomato or Corn leaves • JPG, PNG under 10MB
            </p>
          </div>
        )}

        {/* Thumbnail Specimen Previews Grid */}
        {files.length > 0 && !allDone && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {files.map((fileObj) => (
                <div
                  key={fileObj.id}
                  className="bg-lab-surface border border-lab-sage/10 rounded p-2 relative flex flex-col justify-between group overflow-hidden"
                >
                  {/* Remove Specimen button */}
                  {!isSubmitting && (
                    <button
                      onClick={() => removeFile(fileObj.id)}
                      className="absolute top-1 right-1 bg-lab-bg/85 hover:bg-lab-rust hover:text-lab-bg text-lab-text-primary p-1 rounded-full z-20 border border-lab-sage/25 transition duration-150"
                      aria-label="Remove specimen"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Thumbnail Image Container */}
                  <div className="relative aspect-square w-full rounded bg-lab-bg overflow-hidden border border-lab-sage/10 mb-2">
                    <img
                      src={fileObj.previewUrl}
                      alt={fileObj.file.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Scanning Animation Sweep */}
                    {fileObj.status === 'scanning' && <ScanLineAnimation />}
                  </div>

                  {/* Metadata */}
                  <div className="font-mono text-[9px] text-lab-text-muted truncate max-w-full">
                    {fileObj.file.name}
                  </div>
                  <div className="font-mono text-[8px] text-lab-gold mt-0.5">
                    SIZE: {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              ))}
              
              {/* Inline Add More Button */}
              {!isSubmitting && (
                <button
                  type="button"
                  onClick={triggerFilePicker}
                  className="aspect-square border border-dashed border-lab-sage/20 hover:border-lab-gold/50 rounded flex flex-col items-center justify-center bg-lab-surface/30 text-lab-text-muted hover:text-lab-gold transition duration-200"
                  aria-label="Add more specimens"
                >
                  <UploadCloud className="w-6 h-6 mb-1" />
                  <span className="font-mono text-[9px] uppercase">ADD_MORE</span>
                  
                </button>
              )}
            </div>

            {/* Run Action Area */}
            <div className="flex justify-between items-center pt-4 border-t border-lab-sage/10">
              <button
                onClick={resetAll}
                disabled={isSubmitting}
                className="font-mono text-[10px] text-lab-text-muted hover:text-lab-rust flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none transition duration-150"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                CLEAR_BATCH
              </button>

              <motion.button
                layoutId="action-btn"
                onClick={runDiagnostics}
                disabled={isSubmitting}
                className="bg-lab-gold hover:bg-lab-text-primary text-lab-bg font-sans font-semibold px-6 py-2.5 rounded shadow disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {isSubmitting ? 'ANALYZING...' : 'START DIAGNOSTIC SCAN'}
              </motion.button>
            </div>
          </div>
        )}

        {/* Diagnostic Results Grid */}
        {allDone && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {files.map((fileObj) => (
                <div key={fileObj.id} className="space-y-2">
                  {fileObj.status === 'done' && (
                    <ResultCard result={fileObj.result} fileName={fileObj.file.name} />
                  )}

                  {fileObj.status === 'error' && (
                    <div className="bg-lab-surface border border-lab-rust/20 rounded-lg p-4 relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 right-0 w-8 h-8 bg-lab-rust/10 flex items-center justify-center border-l border-b border-lab-rust/20 rounded-bl">
                        <AlertOctagon className="w-4 h-4 text-lab-rust" />
                      </div>
                      <div className="font-mono text-[9px] text-lab-text-muted mb-2 truncate">
                        SPECIMEN_ID: {fileObj.file.name}
                      </div>
                      <span className="font-mono text-[10px] uppercase text-lab-rust block mb-0.5 font-semibold">
                        DIAGNOSTIC_FAILURE:
                      </span>
                      <p className="font-mono text-[11px] text-lab-text-muted bg-lab-rust/5 border border-lab-rust/15 p-2 rounded leading-tight">
                        {fileObj.error}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Done Action Area */}
            <div className="flex justify-end pt-4 border-t border-lab-sage/10">
              <button
                onClick={resetAll}
                className="bg-lab-gold hover:bg-lab-text-primary text-lab-bg font-sans font-semibold px-6 py-2.5 rounded shadow transition duration-200"
              >
                DIAGNOSE ANOTHER
              </button>
            </div>
          </div>
        )}

        {/* Recent Scans Registry */}
        <div className="mt-8 pt-6 border-t border-lab-sage/10 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-lab-gold">
              // RECENT_DIAGNOSTICS_REGISTRY
            </h3>
            <span className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border self-start ${
              supabaseConnected 
                ? 'text-lab-sage bg-lab-sage/5 border-lab-sage/20' 
                : 'text-lab-gold bg-lab-gold/5 border-lab-gold/20'
            }`}>
              SUPABASE_DB: {supabaseConnected ? 'ONLINE_CONNECTED' : 'RUNNING_DEMO_MOCK'}
            </span>
          </div>
          
          {/* Selected record detail preview */}
          {selectedRecord && (
            <div className="mb-4 p-4 border border-lab-sage/10 rounded bg-lab-surface flex gap-4 items-start">
              {selectedRecord.image_url ? (
                <img src={selectedRecord.image_url} alt="selected specimen" className="w-28 h-28 rounded object-cover border border-lab-sage/20" />
              ) : (
                <div className="w-28 h-28 rounded border border-lab-sage/10 bg-lab-bg flex items-center justify-center text-[10px] text-lab-text-muted">No Image</div>
              )}
              <div className="flex-1">
                <ResultCard
                  result={{
                    class_display: selectedRecord.predicted_class,
                    crop: selectedRecord.crop,
                    confidence: selectedRecord.confidence,
                    is_healthy: selectedRecord.is_healthy,
                  }}
                  fileName={selectedRecord.image_filename}
                />
                <div className="mt-2 text-right">
                  <button onClick={() => setSelectedRecord(null)} className="font-mono text-[10px] text-lab-text-muted hover:text-lab-rust">Close</button>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto border border-lab-sage/15 rounded bg-lab-bg/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-lab-sage/10 font-mono text-[9px] text-lab-text-muted uppercase bg-lab-surface/30">
                  <th className="py-2 px-3">TIMESTAMP</th>
                  <th className="py-2 px-3">PREVIEW</th>
                  <th className="py-2 px-3">SPECIMEN_NAME</th>
                  <th className="py-2 px-3">CROP</th>
                  <th className="py-2 px-3">DIAGNOSTIC_RESULT</th>
                  <th className="py-2 px-3 text-right">CONF</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[10px] divide-y divide-lab-sage/5">
                {history.length > 0 ? (
                  history.slice(0, 8).map((record) => (
                    <tr
                      key={record.id}
                      onClick={() => handleSelectRecord(record)}
                      className="hover:bg-lab-surface/30 transition-colors cursor-pointer"
                    >
                      <td className="py-2 px-3 text-lab-text-muted">
                        {new Date(record.created_at).toLocaleString()}
                      </td>
                      <td className="py-2 px-3">
                        {record.image_url ? (
                          <img
                            src={record.image_url}
                            alt="specimen preview"
                            className="w-7 h-7 rounded border border-lab-sage/20 object-cover bg-lab-surface"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-7 h-7 rounded border border-lab-sage/10 bg-lab-surface flex items-center justify-center text-[8px] text-lab-text-muted">
                            N/A
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3 truncate max-w-[120px] text-lab-text-primary">
                        {record.image_filename || 'unknown.jpg'}
                      </td>
                      <td className="py-2 px-3 uppercase text-[9px]">
                        <span className={`px-1.5 py-0.5 rounded ${record.crop === 'tomato' ? 'text-[#b85a46] bg-[#b85a46]/5' : 'text-lab-gold bg-lab-gold/5'}`}>
                          {record.crop}
                        </span>
                      </td>
                      <td className={`py-2 px-3 font-semibold ${record.is_healthy ? 'text-lab-sage' : 'text-lab-rust'}`}>
                        {record.predicted_class}
                      </td>
                      <td className="py-2 px-3 text-right text-lab-text-primary font-bold">
                        {Math.round(record.confidence * 100)}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-lab-text-muted italic">
                      NO_SPECIMENS_REGISTERED_YET
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
