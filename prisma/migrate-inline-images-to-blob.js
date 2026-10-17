/**
 * Migra imagens gravadas no banco como data: URI (base64) para o Vercel Blob,
 * deixando só a URL pública no campo. O arquivo enviado é o original, byte a
 * byte (a otimização fica a cargo do next/image na exibição).
 *
 * Simulação (não grava nada):
 *   node --env-file=.env --env-file=.env.local prisma/migrate-inline-images-to-blob.js
 * Aplicar:
 *   node --env-file=.env --env-file=.env.local prisma/migrate-inline-images-to-blob.js --apply
 *
 * Antes de gravar, salva os valores originais em backups/ (ignorado pelo git).
 */
const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')
const { put } = require('@vercel/blob')

const prisma = new PrismaClient()
const APPLY = process.argv.includes('--apply')

const TARGETS = [
  { model: 'clientProject', label: (r) => r.slug, fields: ['mockupCardUrl', 'mockupHeroUrl', 'logoUrl'] },
  { model: 'testimonial', label: (r) => r.id, fields: ['avatarUrl'] },
  { model: 'sectionHeroConfig', label: (r) => r.id, fields: ['socialAvatar1', 'socialAvatar2', 'socialAvatar3', 'socialAvatar4'] },
  { model: 'seoConfig', label: (r) => r.id, fields: ['ogImage'] },
]

const EXTENSIONS = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
}

function parseDataUri(value) {
  const match = value.match(/^data:([^;,]+);base64,([\s\S]*)$/)
  if (!match) return null
  return { mime: match[1], buffer: Buffer.from(match[2], 'base64') }
}

async function main() {
  const jobs = []
  for (const { model, label, fields } of TARGETS) {
    const rows = await prisma[model].findMany()
    for (const row of rows) {
      for (const field of fields) {
        const value = row[field]
        if (typeof value !== 'string' || !value.startsWith('data:')) continue
        const parsed = parseDataUri(value)
        if (!parsed) {
          console.warn(`⚠️  ${model}/${label(row)}.${field}: data URI não reconhecido — ignorado`)
          continue
        }
        jobs.push({ model, id: row.id, label: label(row), field, value, ...parsed })
      }
    }
  }

  if (jobs.length === 0) {
    console.log('Nenhuma imagem em base64 encontrada. Nada a fazer.')
    return
  }

  console.log(`${jobs.length} imagem(ns) em base64:`)
  for (const j of jobs) {
    console.log(`  ${j.model}/${j.label}.${j.field}  ${j.mime}  ${(j.buffer.length / 1024).toFixed(0)} KB`)
  }

  if (!APPLY) {
    console.log('\nSimulação. Rode com --apply para enviar ao Blob e atualizar o banco.')
    return
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('BLOB_READ_WRITE_TOKEN não definido (.env.local).')

  const backupDir = path.join(__dirname, '..', 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const backupFile = path.join(backupDir, `inline-images-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
  fs.writeFileSync(
    backupFile,
    JSON.stringify(jobs.map(({ model, id, label, field, value }) => ({ model, id, label, field, value })), null, 2),
  )
  console.log(`\nBackup dos valores originais: ${backupFile}\n`)

  for (const j of jobs) {
    const ext = EXTENSIONS[j.mime] || 'bin'
    const blob = await put(`cms/${j.model}/${j.label}-${j.field}.${ext}`, j.buffer, {
      access: 'public',
      contentType: j.mime,
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    // Só troca o valor no banco depois de confirmar que o arquivo está acessível e completo.
    const head = await fetch(blob.url, { method: 'HEAD' })
    const size = Number(head.headers.get('content-length'))
    if (!head.ok || size !== j.buffer.length) {
      throw new Error(`Verificação falhou para ${blob.url} (status ${head.status}, ${size} de ${j.buffer.length} bytes)`)
    }

    await prisma[j.model].update({ where: { id: j.id }, data: { [j.field]: blob.url } })
    console.log(`✅ ${j.model}/${j.label}.${j.field} → ${blob.url}`)
  }

  console.log(`\n${jobs.length} imagem(ns) migrada(s).`)
}

main()
  .catch((err) => {
    console.error('❌', err.message || err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
