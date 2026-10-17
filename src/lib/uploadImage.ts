// Envia um arquivo de imagem para /api/upload (Vercel Blob) e devolve a URL pública.
export async function uploadImage(file: File): Promise<string> {
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
  if (!res.ok || !data.url) throw new Error(data.error || 'Erro ao fazer upload da imagem.')
  return data.url as string
}
