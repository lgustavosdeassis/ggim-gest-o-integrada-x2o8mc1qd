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
  activity?: ActivityRecord,
): Promise<Blob | null> {
  const { name, url } = doc

  if (url && url.startsWith('data:')) {
    try {
      const res = await fetch(url)
      return await res.blob()
    } catch (e) {
      console.warn('Fetch failed for data URL, attempting manual base64 decoding.', e)
      try {
        const arr = url.split(',')
        if (arr.length === 2) {
          const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream'
          const bstr = atob(arr[1])
          let n = bstr.length
          const u8arr = new Uint8Array(n)
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
          }
          return new Blob([u8arr], { type: mime })
        }
      } catch (err2) {
        console.error('Failed manual base64 decoding:', err2)
      }
    }
  }

  if (url && url.startsWith('blob:')) {
    try {
      const res = await fetch(url)
      return await res.blob()
    } catch (e) {
      console.warn('Fetch failed for blob URL.', e)
    }
  }

  const lowerName = (name || '').toLowerCase()
  const isPdf = lowerName.endsWith('.pdf')
  const isImg = lowerName.match(/\.(jpg|jpeg|png|gif|webp)$/)

  const fallbackInst = activity?.instance || 'N/A'
  const fallbackType = activity?.eventType || 'N/A'
  const fallbackLoc = activity?.location || 'N/A'
  const fallbackDate = activity?.meetingStart ? formatDateTime(activity.meetingStart) : 'N/A'
  const partsPF = activity?.participantsPF ? parseSemicolonList(activity.participantsPF).length : 0
  const partsPJ = activity?.participantsPJ ? parseSemicolonList(activity.participantsPJ).length : 0
  const hasAcoes = activity?.hasAction ? 'Sim' : 'Nao'

  if (isPdf) {
    const content = [
      'Registro de Atividade - GGIM',
      `Instancia: ${fallbackInst}`,
      `Tipologia: ${fallbackType}`,
      `Modalidade: ${activity?.modality || 'N/A'}`,
      `Data Inicio: ${fallbackDate}`,
      `Local: ${fallbackLoc}`,
      `Participantes PF: ${partsPF}`,
      `Participantes PJ: ${partsPJ}`,
      `Acoes Extras: ${hasAcoes}`,
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
      ctx.fillText(`Instância: ${fallbackInst}`, 40, 110)
      ctx.fillText(`Tipologia: ${fallbackType}`, 40, 150)
      ctx.fillText(`Local: ${fallbackLoc}`, 40, 190)
      ctx.fillText(`Data: ${fallbackDate}`, 40, 230)

      canvas.toBlob((blob) => {
        resolve(blob || new Blob([''], { type: 'image/png' }))
      }, 'image/png')
    })
  }

  const textContent = `Registro de Atividade - GGIM\n\nInstancia: ${fallbackInst}\nTipologia: ${fallbackType}\nLocal: ${fallbackLoc}\nData: ${fallbackDate}\n\n(Documento Gerado Dinamicamente)`
  return new Blob([textContent], { type: 'text/plain' })
}

export async function openDocumentViewer(doc: ActivityDocument, activity?: ActivityRecord) {
  const win = window.open('', '_blank')
  if (!win) {
    alert('Por favor, permita pop-ups no seu navegador para visualizar o documento.')
    return
  }

  win.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>${doc.name || 'Visualizador de Documento'}</title>
      <style>
        body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #0f172a; color: white; font-family: sans-serif; }
        .spinner { width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.1); border-left-color: #eab308; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px auto; }
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <div style="text-align: center;">
        <div class="spinner"></div>
        <div style="font-weight: 500;">Preparando visualização segura...</div>
      </div>
    </body>
    </html>
  `)
  win.document.close()

  try {
    const blob = await getDocumentBlob(doc, activity)
    if (blob) {
      const blobUrl = URL.createObjectURL(blob)
      win.location.href = blobUrl
      setTimeout(() => URL.revokeObjectURL(blobUrl), 15000)
    } else if (doc.url && !doc.url.startsWith('data:') && !doc.url.startsWith('blob:')) {
      win.location.href = doc.url
    } else {
      win.document.body.innerHTML =
        '<div style="padding: 20px; text-align: center; color: #ff4444; font-weight: bold;">Erro: Não foi possível carregar o conteúdo do documento.</div>'
    }
  } catch (err) {
    console.error('Erro na visualização:', err)
    if (win.document.body) {
      win.document.body.innerHTML =
        '<div style="padding: 20px; text-align: center; color: #ff4444; font-weight: bold;">Ocorreu um erro ao processar o documento.</div>'
    }
  }
}

export async function downloadDocument(doc: ActivityDocument, activity?: ActivityRecord) {
  try {
    const blob = await getDocumentBlob(doc, activity)
    let downloadUrl = ''
    let isObjectUrl = false

    if (blob) {
      downloadUrl = URL.createObjectURL(blob)
      isObjectUrl = true
    } else if (doc.url && !doc.url.startsWith('C:') && !doc.url.startsWith('blob:')) {
      downloadUrl = doc.url
    }

    if (downloadUrl) {
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = doc.name || 'documento'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      if (isObjectUrl) {
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
      }
    }
  } catch (err) {
    console.error('Erro ao baixar documento:', err)
    alert('Houve um erro ao tentar realizar o download.')
  }
}
