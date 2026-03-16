import { Button } from '@/components/ui/button'
import { Eye, Download, FileX } from 'lucide-react'
import { Document as ActivityDocument, ActivityRecord } from '@/lib/types'
import { getDocumentBlob } from '@/lib/utils'

export function DocumentList({
  documents,
  activity,
}: {
  documents?: ActivityDocument[]
  activity: ActivityRecord
}) {
  const handleView = async (doc: ActivityDocument) => {
    try {
      const newWin = window.open('', '_blank')

      if (newWin) {
        newWin.document.write(`
          <!DOCTYPE html>
          <html>
          <head><title>Carregando ${doc.name}...</title></head>
          <body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;background:#0f172a;color:#fff;font-family:sans-serif;">
            <h2>Processando documento...</h2>
          </body>
          </html>
        `)
      }

      const blob = await getDocumentBlob(doc, activity)

      if (blob) {
        const url = URL.createObjectURL(blob)
        if (newWin) {
          const isPdf = doc.name.toLowerCase().endsWith('.pdf')
          const isImg = doc.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
          const title = doc.name || 'Visualizar Documento'

          let content = ''
          if (isPdf) {
            content = `<iframe src="${url}" style="width:100vw;height:100vh;border:none;"></iframe>`
          } else if (isImg) {
            content = `<div style="display:flex;justify-content:center;align-items:center;height:100vh;background-color:#0f172a;"><img src="${url}" style="max-width:100%;max-height:100%;object-fit:contain;" /></div>`
          } else {
            content = `<iframe src="${url}" style="width:100vw;height:100vh;border:none;"></iframe>`
          }

          newWin.document.open()
          newWin.document.write(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${title}</title>
              <style>body { margin: 0; padding: 0; overflow: hidden; background-color: #0f172a; }</style>
            </head>
            <body>
              ${content}
            </body>
            </html>
          `)
          newWin.document.close()
        } else {
          const a = document.createElement('a')
          a.href = url
          a.target = '_blank'
          a.click()
        }
      } else if (doc.url && !doc.url.startsWith('C:') && !doc.url.startsWith('blob:')) {
        if (newWin) newWin.location.href = doc.url
        else window.open(doc.url, '_blank')
      } else {
        if (newWin) newWin.close()
      }
    } catch (err) {
      console.error('Erro ao visualizar documento:', err)
    }
  }

  const handleDownload = async (doc: ActivityDocument) => {
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
        a.download = doc.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        if (isObjectUrl) {
          setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
        }
      }
    } catch (err) {
      console.error('Erro ao baixar documento:', err)
    }
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/30 border border-border border-dashed rounded-xl text-center">
        <FileX className="w-8 h-8 text-muted-foreground/40 mb-3" />
        <span className="text-sm font-semibold text-muted-foreground">Nenhum arquivo anexado</span>
        <span className="text-xs text-muted-foreground/70 mt-1">
          Este registro não possui documentos ou imagens.
        </span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {documents.map((doc, idx) => (
        <div
          key={idx}
          className="flex flex-col gap-3 bg-card p-4 border border-border rounded-xl shadow-sm hover:border-primary/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold text-sm text-foreground line-clamp-2" title={doc.name}>
              {doc.name}
            </span>
            <span className="text-[10px] font-black bg-muted px-2 py-1 rounded uppercase tracking-widest text-primary shrink-0 border border-border mt-0.5">
              {doc.type || 'S/TIPO'}
            </span>
          </div>
          <div className="flex gap-2 mt-auto pt-3 border-t border-border/50">
            <Button
              size="sm"
              className="flex-1 text-xs font-bold h-8 bg-[#0f172a] hover:bg-[#1e293b] text-white transition-colors"
              onClick={() => handleView(doc)}
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" /> Visualizar
            </Button>
            <Button
              size="sm"
              className="flex-1 text-xs font-bold h-8 bg-[#eab308] hover:bg-[#ca8a04] text-[#0f172a] transition-colors"
              onClick={() => handleDownload(doc)}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> Baixar
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
