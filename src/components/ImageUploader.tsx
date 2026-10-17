'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, XCircle, Loader2, AlertCircle } from 'lucide-react'

interface ImageUploaderProps {
  label?: string
  description?: string
  aspectHint?: string
  value: string | null | undefined
  onChange: (url: string | null) => void
  accept?: string
  maxMb?: number
}

export default function ImageUploader({
  label,
  description,
  aspectHint,
  value,
  onChange,
  accept = 'image/*',
  maxMb = 8,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Apenas imagens são permitidas.')
      return
    }
    if (file.size > maxMb * 1024 * 1024) {
      setUploadError(`Tamanho máximo: ${maxMb}MB.`)
      return
    }

    setUploading(true)
    setUploadError('')

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, filename: file.name }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro no upload')
      onChange(data.url)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao fazer upload.'
      setUploadError(msg)
    } finally {
      setUploading(false)
    }
  }, [onChange, maxMb])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-2">
      {/* Label row */}
      {(label || aspectHint) && (
        <div className="flex items-center justify-between">
          {label && <label className="block text-sm text-white/60 font-medium">{label}</label>}
          {aspectHint && <span className="text-[10px] text-white/25 font-mono">{aspectHint}</span>}
        </div>
      )}

      {/* Description */}
      {description && <p className="text-white/30 text-xs">{description}</p>}

      {/* Drop zone / Preview */}
      {value ? (
        /* ── Has image — show preview ── */
        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5 group">
          <img
            src={value}
            alt={label || 'Preview'}
            className="w-full object-cover max-h-52"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              Trocar
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium transition-all"
            >
              <XCircle className="w-3.5 h-3.5" />
              Remover
            </button>
          </div>
        </div>
      ) : (
        /* ── No image — drop zone ── */
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' || e.key === ' ' ? fileRef.current?.click() : undefined}
          className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer
            flex flex-col items-center justify-center gap-3 py-10 px-6
            focus:outline-none focus:ring-2 focus:ring-orange-500/50
            ${dragOver
              ? 'border-orange-500 bg-orange-500/10'
              : 'border-white/15 hover:border-orange-500/50 hover:bg-white/[0.03]'
            }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
              <p className="text-white/50 text-sm">Enviando imagem...</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Upload className="w-5 h-5 text-white/40" />
              </div>
              <div className="text-center">
                <p className="text-white/60 text-sm font-medium">
                  {dragOver ? 'Solte a imagem aqui' : 'Clique ou arraste a imagem'}
                </p>
                <p className="text-white/25 text-xs mt-0.5">PNG, JPG, WebP — máx. {maxMb}MB</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {uploadError && (
        <p className="text-red-400 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {uploadError}
        </p>
      )}

      {/* Hidden file input — accessible on all browsers */}
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleFileChange}
        aria-label={label || 'Upload de imagem'}
        tabIndex={-1}
      />
    </div>
  )
}
