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
    // Open a new tab immediately to prevent popup blockers
    const win = window.open('', '_blank')
    if (!win) {
      alert('Por favor, permita pop-ups no seu navegador para visualizar o documento.')
      return
    }

    win.document.title = doc.name || 'Processando Documento...'
    win.document.body.innerHTML = `
      <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;background-color:#f8fafc;margin:0;">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite; margin-bottom: 16px; opacity: 0.5;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        <h2 style="margin:0;font-weight:600;font-size:1.25rem;">Preparando visualização...</h2>
        <p style="margin-top:8px;color:#64748b;font-size:0.875rem;">O arquivo será exibido nesta guia em instantes.</p>
        <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
      </div>
    `

    try {
      const blob = await getDocumentBlob(doc, activity)
      if (blob) {
        win.location.replace(URL.createObjectURL(blob))
      } else if (doc.url && !doc.url.startsWith('C:') && !doc.url.startsWith('blob:')) {
        win.location.replace(doc.url)
      } else {
        win.close()
        alert('Não foi possível carregar o documento para visualização.')
      }
    } catch (err) {
      console.error('Erro ao visualizar documento:', err)
      win.close()
      alert('Houve um erro ao tentar visualizar este documento.')
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
              variant="ghost"
              className="flex-1 text-xs font-bold h-8 bg-[#0f172a] hover:bg-[#1e293b] text-white transition-colors"
              onClick={(e) => {
                e.preventDefault()
                handleView(doc)
              }}
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" /> Visualizar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 text-xs font-bold h-8 bg-[#eab308] hover:bg-[#ca8a04] text-[#0f172a] transition-colors"
              onClick={(e) => {
                e.preventDefault()
                handleDownload(doc)
              }}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> Baixar
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
