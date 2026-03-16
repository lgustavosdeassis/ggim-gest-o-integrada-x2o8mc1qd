import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Document as ActivityDocument, ActivityRecord } from '@/lib/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateHoursDifference(start: string, end: string): number {
  if (!start || !end) return 0
  const d1 = new Date(start)
  let d2 = new Date(end)

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0

  if (d2.getTime() < d1.getTime()) {
    d2 = new Date(d2.getTime() + 24 * 60 * 60 * 1000)
  }

  const diffMs = d2.getTime() - d1.getTime()
  return diffMs > 0 ? diffMs / (1000 * 60 * 60) : 0
}

export function parseSemicolonList(text: string): string[] {
  if (!text) return []
  return text
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export async function getDocumentBlob(
  doc: ActivityDocument,
  activity: ActivityRecord,
): Promise<Blob | null> {
  const { name, url } = doc

  if (url && url.startsWith('data:')) {
    const res = await fetch(url)
    return await res.blob()
  }

  const lowerName = name.toLowerCase()
  const isPdf = lowerName.endsWith('.pdf')
  const isImg = lowerName.match(/\.(jpg|jpeg|png|gif)$/)

  if (isPdf) {
    const content = [
      'Registro de Atividade - GGIM',
      `Instancia: ${activity.instance}`,
      `Tipologia: ${activity.eventType}`,
      `Modalidade: ${activity.modality}`,
      `Data Inicio: ${formatDateTime(activity.meetingStart)}`,
      `Data Fim: ${formatDateTime(activity.meetingEnd)}`,
      `Local: ${activity.location}`,
      `Participantes PF: ${parseSemicolonList(activity.participantsPF).length}`,
      `Participantes PJ: ${parseSemicolonList(activity.participantsPJ).length}`,
      `Acoes Extras: ${activity.hasAction ? 'Sim' : 'Nao'}`,
    ]

    let streamData = 'BT\n/F1 12 Tf\n15 TL\n50 750 Td\n'
    for (const line of content) {
      const escaped = line.replace(/[^\x20-\x7E]/g, '').replace(/[()]/g, '\\$&')
      streamData += `(${escaped}) Tj T*\n`
    }
    streamData += 'ET'

    const objects: string[] = []
    objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`)
    objects.push(
      `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 /MediaBox [0 0 595 842] >>\nendobj`,
    )
    objects.push(
      `3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj`,
    )
    objects.push(`4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`)
    objects.push(
      `5 0 obj\n<< /Length ${streamData.length} >>\nstream\n${streamData}\nendstream\nendobj`,
    )

    let pdfStr = '%PDF-1.4\n%\xD3\xEB\xE9\xE1\n'
    const xref: number[] = [0]

    for (const obj of objects) {
      xref.push(pdfStr.length)
      pdfStr += obj + '\n'
    }

    const startxref = pdfStr.length
    pdfStr += `xref\n0 ${xref.length}\n0000000000 65535 f \n`
    for (let i = 1; i < xref.length; i++) {
      pdfStr += xref[i].toString().padStart(10, '0') + ' 00000 n \n'
    }

    pdfStr += `trailer\n<< /Size ${xref.length} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`

    const bytes = new Uint8Array(pdfStr.length)
    for (let i = 0; i < pdfStr.length; i++) {
      bytes[i] = pdfStr.charCodeAt(i) & 0xff
    }

    return new Blob([bytes], { type: 'application/pdf' })
  }

  if (isImg) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      canvas.width = 800
      canvas.height = 600
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(new Blob([''], { type: 'image/png' }))
        return
      }

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 800, 600)

      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 24px Arial'
      ctx.fillText('Registro de Atividade - GGIM', 40, 60)

      ctx.font = '18px Arial'
      ctx.fillText(`Instância: ${activity.instance}`, 40, 110)
      ctx.fillText(`Tipologia: ${activity.eventType}`, 40, 150)
      ctx.fillText(`Local: ${activity.location}`, 40, 190)
      ctx.fillText(`Data: ${formatDateTime(activity.meetingStart)}`, 40, 230)

      canvas.toBlob((blob) => {
        resolve(blob || new Blob([''], { type: 'image/png' }))
      }, 'image/png')
    })
  }

  const textContent = `Registro de Atividade - GGIM\n\nInstancia: ${activity.instance}\nTipologia: ${activity.eventType}\nLocal: ${activity.location}\nData: ${formatDateTime(activity.meetingStart)}\n\n(Documento Gerado Dinamicamente)`
  return new Blob([textContent], { type: 'text/plain' })
}
