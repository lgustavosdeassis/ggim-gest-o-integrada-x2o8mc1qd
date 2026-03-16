import { Button } from '@/components/ui/button'
import { Eye, Download, FileX } from 'lucide-react'
import { Document as ActivityDocument } from '@/lib/types'
import { getDocumentBlob } from '@/lib/utils'

export function DocumentList({ documents }: { documents?: ActivityDocument[] }) {
  const handleView = async (doc: ActivityDocument) => {
    try {
      const blob = await getDocumentBlob(doc.name, doc.type, doc.url)
      if (!blob && doc.url) {
        window.open(doc.url, '_blank')
        return
      }
      if (blob) {
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDownload = async (doc: ActivityDocument) => {
    try {
      const blob = await getDocumentBlob(doc.name, doc.type, doc.url)
      let downloadUrl = doc.url
      let isObjectUrl = false

      if (blob) {
        downloadUrl = URL.createObjectURL(blob)
        isObjectUrl = true
      }

      if (downloadUrl) {
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = doc.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        if (isObjectUrl) {
          setTimeout(() => URL.revokeObjectURL(downloadUrl!), 1000)
        }
      }
    } catch (err) {
      console.error(err)
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
              variant="outline"
              className="flex-1 text-xs font-bold h-8 bg-background"
              onClick={() => handleView(doc)}
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" /> Visualizar
            </Button>
            <Button
              size="sm"
              className="flex-1 text-xs font-bold h-8"
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
