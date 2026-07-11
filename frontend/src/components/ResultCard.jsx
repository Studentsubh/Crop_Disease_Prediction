import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Leaf, ShieldCheck, AlertTriangle } from 'lucide-react'

const DISEASE_PROFILES = {
  Tomato___Bacterial_spot: {
    title: 'Tomato — Bacterial Spot',
    severity: 'High (can reduce yield by 10–50%)',
    symptoms: [
      'Small dark brown or black spots on leaves',
      'Yellow halo around spots',
      'Leaf yellowing and premature leaf drop',
      'Dark lesions on fruits'
    ],
    causes: [
      'Xanthomonas bacteria',
      'Warm, humid weather',
      'Infected seeds and crop debris',
      'Splashing rain or overhead irrigation'
    ],
    treatment: [
      'Apply copper-based bactericides',
      'Remove infected leaves',
      'Avoid working with wet plants'
    ],
    prevention: [
      'Use certified disease-free seeds',
      'Practice crop rotation',
      'Avoid overhead watering',
      'Sanitize garden tools'
    ]
  },
  Tomato___Early_blight: {
    title: 'Tomato — Early Blight',
    severity: 'Moderate to High',
    symptoms: [
      'Brown spots with concentric rings (target-like)',
      'Yellowing around lesions',
      'Lower leaves affected first',
      'Premature leaf drop'
    ],
    causes: [
      'Fungus: Alternaria solani',
      'Warm temperatures',
      'High humidity',
      'Poor plant nutrition'
    ],
    treatment: [
      'Remove infected foliage',
      'Apply fungicides (chlorothalonil, mancozeb)',
      'Improve air circulation'
    ],
    prevention: [
      'Rotate crops',
      'Mulch around plants',
      'Avoid wet foliage',
      'Keep plants properly spaced'
    ]
  },
  Tomato___Late_blight: {
    title: 'Tomato — Late Blight',
    severity: 'Very High (can destroy crops rapidly)',
    symptoms: [
      'Large water-soaked lesions',
      'Brown to black leaves',
      'White fungal growth underneath leaves',
      'Fruit rot'
    ],
    causes: [
      'Phytophthora infestans',
      'Cool and wet weather',
      'High humidity'
    ],
    treatment: [
      'Remove infected plants immediately',
      'Apply appropriate fungicides',
      'Improve drainage'
    ],
    prevention: [
      'Use resistant varieties',
      'Avoid overcrowding',
      'Monitor fields during rainy seasons',
      'Remove infected crop debris'
    ]
  },
  Tomato___Leaf_Mold: {
    title: 'Tomato — Leaf Mold',
    severity: 'Moderate',
    symptoms: [
      'Yellow patches on upper leaf surface',
      'Olive-green or gray mold beneath leaves',
      'Curling and drying leaves'
    ],
    causes: [
      'Fungus: Passalora fulva',
      'High humidity',
      'Poor ventilation'
    ],
    treatment: [
      'Apply fungicides',
      'Reduce greenhouse humidity',
      'Remove infected leaves'
    ],
    prevention: [
      'Improve air circulation',
      'Avoid excessive watering',
      'Maintain recommended spacing'
    ]
  },
  Tomato___Septoria_leaf_spot: {
    title: 'Tomato — Septoria Leaf Spot',
    severity: 'Moderate',
    symptoms: [
      'Numerous tiny circular spots',
      'Gray centers with dark borders',
      'Yellowing leaves',
      'Defoliation'
    ],
    causes: [
      'Fungus: Septoria lycopersici',
      'Wet weather',
      'Splashing water'
    ],
    treatment: [
      'Remove infected leaves',
      'Apply fungicides',
      'Avoid overhead irrigation'
    ],
    prevention: [
      'Crop rotation',
      'Mulching',
      'Field sanitation'
    ]
  },
  Tomato___Spider_mites_Two_spotted_spider_mite: {
    title: 'Tomato — Spider Mites (Two-Spotted Spider Mite)',
    severity: 'Moderate to High',
    symptoms: [
      'Tiny yellow or white speckles',
      'Fine webbing on leaves',
      'Leaf bronzing',
      'Premature leaf drop'
    ],
    causes: [
      'Spider mite infestation',
      'Hot, dry weather',
      'Dusty conditions'
    ],
    treatment: [
      'Spray miticides if needed',
      'Use insecticidal soap or neem oil',
      'Introduce predatory mites where appropriate'
    ],
    prevention: [
      'Keep plants well-watered',
      'Reduce dust',
      'Regularly inspect leaves'
    ]
  },
  Tomato___Target_Spot: {
    title: 'Tomato — Target Spot',
    severity: 'Moderate',
    symptoms: [
      'Circular brown lesions',
      'Concentric rings',
      'Yellow leaf margins',
      'Fruit lesions'
    ],
    causes: [
      'Fungus: Corynespora cassiicola',
      'Warm, humid conditions'
    ],
    treatment: [
      'Remove infected foliage',
      'Apply fungicides',
      'Improve airflow'
    ],
    prevention: [
      'Crop rotation',
      'Field sanitation',
      'Avoid prolonged leaf wetness'
    ]
  },
  Tomato___Tomato_mosaic_virus: {
    title: 'Tomato — Tomato Mosaic Virus (ToMV)',
    severity: 'High',
    symptoms: [
      'Green-yellow mosaic pattern',
      'Leaf curling',
      'Stunted growth',
      'Reduced fruit quality'
    ],
    causes: [
      'Tomato Mosaic Virus',
      'Contaminated tools',
      'Infected seeds',
      'Human handling'
    ],
    treatment: [
      'No cure available',
      'Remove infected plants'
    ],
    prevention: [
      'Use certified seeds',
      'Disinfect tools',
      'Wash hands after handling infected plants',
      'Grow resistant varieties'
    ]
  },
  Tomato___Tomato_Yellow_Leaf_Curl_Virus: {
    title: 'Tomato — Tomato Yellow Leaf Curl Virus (TYLCV)',
    severity: 'Very High',
    symptoms: [
      'Upward leaf curling',
      'Yellow leaves',
      'Stunted plants',
      'Poor fruit production'
    ],
    causes: [
      'Tomato Yellow Leaf Curl Virus',
      'Spread mainly by whiteflies'
    ],
    treatment: [
      'Remove infected plants',
      'Control whitefly population'
    ],
    prevention: [
      'Use resistant varieties',
      'Install insect nets',
      'Monitor and control whiteflies',
      'Remove weed hosts'
    ]
  },
  Tomato___healthy: {
    title: 'Tomato — Healthy',
    severity: 'None',
    symptoms: [
      'Green, healthy leaves',
      'No visible lesions',
      'Normal growth'
    ],
    causes: [
      'Healthy plant'
    ],
    treatment: [
      'No treatment required'
    ],
    prevention: [
      'Continue proper irrigation',
      'Balanced fertilization',
      'Regular monitoring',
      'Good field sanitation'
    ]
  },
  'Corn_(maize)___Cercospora_leaf_spot_Gray_leaf_spot': {
    title: 'Corn — Gray Leaf Spot',
    severity: 'Moderate to High',
    symptoms: [
      'Long rectangular gray lesions',
      'Lesions run parallel to leaf veins',
      'Premature drying'
    ],
    causes: [
      'Fungus: Cercospora zeae-maydis',
      'Warm, humid conditions',
      'Infected crop residue'
    ],
    treatment: [
      'Apply fungicides if economically justified',
      'Remove infected residues'
    ],
    prevention: [
      'Crop rotation',
      'Resistant hybrids',
      'Good field sanitation'
    ]
  },

  'Corn_(maize)___Common_rust': {
    title: 'Corn — Common Rust',
    severity: 'Low to Moderate',
    symptoms: [
      'Small reddish-brown pustules',
      'Pustules on both leaf surfaces',
      'Leaves may yellow'
    ],
    causes: [
      'Fungus: Puccinia sorghi',
      'Cool, humid weather',
      'Wind-dispersed spores'
    ],
    treatment: [
      'Apply fungicides if infection is severe',
      'Monitor crop regularly'
    ],
    prevention: [
      'Plant resistant hybrids',
      'Early sowing where appropriate',
      'Field monitoring'
    ]
  },

  'Corn_(maize)___Northern_leaf_blight': {
    title: 'Corn — Northern Leaf Blight',
    severity: 'High',
    symptoms: [
      'Long cigar-shaped gray-green lesions',
      'Large dead areas on leaves',
      'Reduced photosynthesis'
    ],
    causes: [
      'Fungus: Exserohilum turcicum',
      'Humid weather',
      'Infected crop residue'
    ],
    treatment: [
      'Apply fungicides',
      'Remove infected debris'
    ],
    prevention: [
      'Resistant hybrids',
      'Crop rotation',
      'Proper field sanitation'
    ]
  },

  'Corn_(maize)___healthy': {
    title: 'Corn — Healthy',
    severity: 'None',
    symptoms: [
      'Uniform green leaves',
      'No disease lesions',
      'Healthy growth'
    ],
    causes: [
      'Healthy crop'
    ],
    treatment: [
      'No treatment required'
    ],
    prevention: [
      'Maintain balanced nutrition',
      'Proper irrigation',
      'Weed control',
      'Regular scouting'
    ]
  }
}


function getDiseaseProfile(rawLabel = '', displayName = '') {
  if (rawLabel && DISEASE_PROFILES[rawLabel]) return DISEASE_PROFILES[rawLabel]

  const normalized = `${rawLabel} ${displayName}`.toLowerCase()
  if (normalized.includes('bacterial spot')) {
    return DISEASE_PROFILES.Tomato___Bacterial_spot
  }
  if (normalized.includes('early blight')) {
    return DISEASE_PROFILES.Tomato___Early_blight
  }
  if (normalized.includes('late blight')) {
    return DISEASE_PROFILES.Tomato___Late_blight
  }
  if (normalized.includes('leaf mold')) {
    return DISEASE_PROFILES.Tomato___Leaf_Mold
  }
  if (normalized.includes('septoria') || normalized.includes('leaf spot')) {
    return DISEASE_PROFILES.Tomato___Septoria_leaf_spot
  }
  if (normalized.includes('spider mite') || normalized.includes('spider mites')) {
    return DISEASE_PROFILES.Tomato___Spider_mites_Two-spotted_spider_mite
  }
  if (normalized.includes('target spot')) {
    return DISEASE_PROFILES.Tomato___Target_Spot
  }
  if (normalized.includes('mosaic virus') || normalized.includes('tomato mosaic')) {
    return DISEASE_PROFILES.Tomato___Tomato_mosaic_virus
  }
  if (normalized.includes('yellow leaf curl') || normalized.includes('tylcv')) {
    return DISEASE_PROFILES.Tomato___Tomato_Yellow_Leaf_Curl_Virus
  }
  // Corn matches (avoid overriding corn healthy with tomato healthy)
  if (normalized.includes('corn') || normalized.includes('maize')) {
    if (normalized.includes('common rust')) {
      return DISEASE_PROFILES['Corn_(maize)___Common_rust']
    }
    if (normalized.includes('northern leaf blight')) {
      return DISEASE_PROFILES['Corn_(maize)___Northern_leaf_blight']
    }
    if (normalized.includes('healthy')) {
      return DISEASE_PROFILES['Corn_(maize)___healthy']
    }
    if (normalized.includes('gray leaf spot') || normalized.includes('cercospora')) {
      return DISEASE_PROFILES['Corn_(maize)___Cercospora_leaf_spot_Gray_leaf_spot']
    }
  }

  // Tomato matches
  if (normalized.includes('bacterial spot')) {
    return DISEASE_PROFILES.Tomato___Bacterial_spot
  }
  if (normalized.includes('early blight')) {
    return DISEASE_PROFILES.Tomato___Early_blight
  }
  if (normalized.includes('late blight')) {
    return DISEASE_PROFILES.Tomato___Late_blight
  }
  if (normalized.includes('leaf mold')) {
    return DISEASE_PROFILES.Tomato___Leaf_Mold
  }
  if (normalized.includes('septoria') || normalized.includes('leaf spot')) {
    return DISEASE_PROFILES.Tomato___Septoria_leaf_spot
  }
  if (normalized.includes('spider mite') || normalized.includes('spider mites')) {
    return DISEASE_PROFILES.Tomato___Spider_mites_Two-spotted_spider_mite
  }
  if (normalized.includes('target spot')) {
    return DISEASE_PROFILES.Tomato___Target_Spot
  }
  if (normalized.includes('mosaic virus') || normalized.includes('tomato mosaic')) {
    return DISEASE_PROFILES.Tomato___Tomato_mosaic_virus
  }
  if (normalized.includes('yellow leaf curl') || normalized.includes('tylcv')) {
    return DISEASE_PROFILES.Tomato___Tomato_Yellow_Leaf_Curl_Virus
  }
  if (normalized.includes('healthy')) {
    return DISEASE_PROFILES.Tomato___healthy
  }

  // Fallbacks
  if (normalized.includes('gray leaf spot') || normalized.includes('cercospora')) {
    return DISEASE_PROFILES['Corn_(maize)___Cercospora_leaf_spot_Gray_leaf_spot']
  }

  return null
}


export default function ResultCard({ result, fileName }) {
  const { class_display, crop, confidence, is_healthy } = result || {}
  const [tickingConf, setTickingConf] = useState(0)
  const diseaseProfile = getDiseaseProfile(result?.class_raw, class_display)

  // Ticking number animation for confidence percentage
  useEffect(() => {
    const end = Math.round((confidence || 0) * 100)
    let start = 0
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
      <div className="flex flex-wrap gap-2 mb-4">
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

      {diseaseProfile && (
        <div className={`mt-3 border-t ${borderAccentClass} pt-3 space-y-2`}>
          <div className={`rounded-lg border ${borderAccentClass} bg-lab-bg/40 p-3 space-y-3`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[9px] uppercase text-lab-text-muted">DISEASE_PROFILE</span>
              <span className={`font-mono text-[10px] uppercase ${bgAccentClass} border ${borderAccentClass} px-2.5 py-1 rounded-full`}>
                {diseaseProfile.title}
              </span>
            </div>

            <div className={`rounded border ${borderAccentClass} bg-lab-surface/40 p-2.5`}>
              <div className="font-mono text-[9px] uppercase text-lab-text-muted mb-1">SEVERITY</div>
              <div className={`font-sans text-[12px] ${accentClass} leading-relaxed`}>{diseaseProfile.severity}</div>
            </div>

            {[
              { label: 'SYMPTOMS', items: diseaseProfile.symptoms },
              { label: 'CAUSES', items: diseaseProfile.causes },
              { label: 'TREATMENT', items: diseaseProfile.treatment },
              { label: 'PREVENTION', items: diseaseProfile.prevention }
            ].map((section) => (
              <div key={section.label} className={`rounded border ${borderAccentClass} bg-lab-surface/30 p-2.5`}>
                <div className="font-mono text-[10px] uppercase text-lab-text-muted mb-1.5">{section.label}</div>
                <ul className="list-disc list-inside space-y-1 font-sans text-[12px] text-lab-text-primary/90 leading-relaxed">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence Score Ticker and Bar */}
      <div className="space-y-1.5 pt-2 mt-3 border-t border-lab-sage/10">
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
