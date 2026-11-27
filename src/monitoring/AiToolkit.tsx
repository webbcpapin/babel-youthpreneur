import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, Clipboard, Sparkles } from 'lucide-react'
import { aiToolkitPhases } from './ai-toolkit-content'
import './AiToolkit.css'

type Prompt = (typeof aiToolkitPhases)[number]['prompts'][number]

function PromptRow({ prompt, number }: { prompt: Prompt; number: number }) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'manual'>('idle')
  const [expanded, setExpanded] = useState(false)
  const previewId = useId()
  const manualInput = useRef<HTMLTextAreaElement>(null)
  const label = String(number).padStart(2, '0')

  useEffect(() => {
    if (copyState !== 'manual' || !expanded) return
    manualInput.current?.focus()
    manualInput.current?.select()
  }, [copyState, expanded])

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt.body)
      setCopyState('copied')
    } catch {
      if (copyState === 'manual' && expanded) {
        manualInput.current?.focus()
        manualInput.current?.select()
      }
      setCopyState('manual')
      setExpanded(true)
    }
  }

  return (
    <li className="ai-prompt-row">
      <button type="button" className="ai-prompt-summary" aria-expanded={expanded} aria-controls={previewId} onClick={() => setExpanded(!expanded)}>
        <span className="ai-prompt-number" aria-hidden="true">{label}</span>
        <span className="ai-prompt-label">
          <strong>{prompt.title}</strong>
          <span>{prompt.outcome}</span>
        </span>
        <ChevronDown className="ai-prompt-chevron" size={16} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`monitoring-button ai-prompt-copy${copyState === 'copied' ? ' is-copied' : ''}`}
        aria-label={`Salin prompt ${label}: ${prompt.title}`}
        onClick={() => { void copy() }}
      >
        {copyState === 'copied' ? <Check size={16} aria-hidden="true" /> : <Clipboard size={16} aria-hidden="true" />}
        {copyState === 'copied' ? 'Tersalin' : 'Salin prompt'}
      </button>
      <div id={previewId} className="ai-prompt-content" hidden={!expanded}>
        {copyState === 'manual' ? (
          <div className="ai-prompt-manual">
            <p>Clipboard tidak dapat diakses. Salin teks yang dipilih secara manual.</p>
            <textarea ref={manualInput} aria-label={`Teks prompt ${label}`} value={prompt.body} readOnly rows={9} />
          </div>
        ) : (
          <pre className="ai-prompt-preview">{prompt.body}</pre>
        )}
      </div>
      <span className="sr-only" role="status">
        {copyState === 'copied' && `Prompt ${label} disalin.`}
        {copyState === 'manual' && `Prompt ${label} tersedia untuk disalin manual.`}
      </span>
    </li>
  )
}

export default function AiToolkit() {
  const [selected, setSelected] = useState(0)
  const phase = aiToolkitPhases[selected]
  const offset = aiToolkitPhases.slice(0, selected).reduce((sum, item) => sum + item.prompts.length, 0)
  const total = aiToolkitPhases.reduce((sum, item) => sum + item.prompts.length, 0)

  return (
    <section className="ai-toolkit" aria-labelledby="ai-toolkit-title">
      <header className="ai-toolkit-header">
        <Sparkles size={22} aria-hidden="true" />
        <div>
          <p className="eyebrow">BYP 2026 · {total} prompt</p>
          <h2 id="ai-toolkit-title">AI Business Mentoring Toolkit</h2>
          <p>Panduan opsional pendampingan UMKM. Gunakan satu percakapan AI per UMKM dan konfirmasikan hasilnya sebelum dipakai dalam laporan.</p>
        </div>
      </header>
      <div className="ai-toolkit-controls" role="group" aria-label="Tahap toolkit">
        {aiToolkitPhases.map((item, index) => (
          <button key={item.title} type="button" aria-pressed={index === selected} onClick={() => setSelected(index)}>
            {item.title}
            <span aria-hidden="true">{item.prompts.length}</span>
          </button>
        ))}
      </div>
      <p className="ai-toolkit-schedule">Jadwal pengerjaan toolkit: <strong>{phase.dates}</strong></p>
      <ol className="ai-prompt-list" start={offset + 1} aria-label={`Prompt ${phase.title}`}>
        {phase.prompts.map((prompt, index) => <PromptRow key={prompt.title} prompt={prompt} number={offset + index + 1} />)}
      </ol>
      <footer className="ai-toolkit-credit">&copy; 2026 @agung3956</footer>
    </section>
  )
}
