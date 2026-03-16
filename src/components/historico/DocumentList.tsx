import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Eye, Download, FileX, FileText, ExternalLink } from 'lucide-react'
import { Document as ActivityDocument, ActivityRecord } from '@/lib/types'
import { getDocumentBlob } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export function DocumentList({
  documents,
  activity,
}: {
  documents?: ActivityDocument[]
  activity: ActivityRecord
}) {
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerContent, setViewerContent] = useState<{
    url: string
    type: string
    name: string
  } | null>(null)

  const handleView = async (doc: ActivityDocument) => {
    try {
      const blob = await getDocumentBlob(doc, activity)
      if (blob) {
        const url = URL.createObjectURL(blob)
        if (blob.type.includes('pdf')) {
          // Open PDF directly in a new tab to bypass iframe "blocked by client" restrictions
          const win = window.open(url, '_blank')
          if (!win) {
            // Popup was blocked, fallback to our internal modal viewer
            setViewerContent({ url, type: blob.type, name: doc.name || 'Documento' })
            setViewerOpen(true)
          } else {
            // Clean up the URL to prevent memory leaks after the new tab loads it
            setTimeout(() => URL.revokeObjectURL(url), 10000)
          }
        } else {
          setViewerContent({ url, type: blob.type, name: doc.name || 'Documento' })
          setViewerOpen(true)
        }
      } else if (doc.url && !doc.url.startsWith('C:') && !doc.url.startsWith('blob:')) {
        window.open(doc.url, '_blank')
      } else {
        alert('Não foi possível carregar o documento para visualização.')
      }
    } catch (err) {
      console.error('Erro ao visualizar documento:', err)
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
    <>
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

      <Dialog
        open={viewerOpen}
        onOpenChange={(open) => {
          setViewerOpen(open)
          if (!open && viewerContent?.url.startsWith('blob:')) {
            setTimeout(() => URL.revokeObjectURL(viewerContent.url), 500)
          }
        }}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-5xl w-full p-0 h-[85vh] flex flex-col bg-background border-border shadow-2xl rounded-2xl overflow-hidden">
          <DialogHeader className="p-4 border-b border-border bg-muted/30">
            <DialogTitle className="flex items-center gap-2 text-foreground font-black text-lg">
              <Eye className="w-5 h-5 text-primary" />
              {viewerContent?.name}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Visualizador de documento integrado
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden bg-muted/10 relative">
            {viewerContent?.type.includes('pdf') ? (
              <div className="w-full h-full flex flex-col">
                <div className="bg-muted/50 p-3 flex items-center justify-between border-b border-border">
                  <span className="text-sm font-semibold text-muted-foreground ml-2 hidden sm:inline-block">
                    Modo de Segurança (Pop-up bloqueado)
                  </span>
                  <Button
                    onClick={() => window.open(viewerContent.url, '_blank')}
                    className="font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg w-full sm:w-auto"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" /> Forçar Abertura em Nova Aba
                  </Button>
                </div>
                <iframe
                  src={viewerContent.url}
                  className="w-full flex-1 border-0 bg-white"
                  title={viewerContent.name}
                />
              </div>
            ) : viewerContent?.type.includes('image') ? (
              <div className="w-full h-full flex items-center justify-center p-6 bg-muted/20">
                <img
                  src={viewerContent.url}
                  alt={viewerContent.name}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                <FileText className="w-20 h-20 text-muted-foreground/30 mb-6" />
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Visualização não disponível
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Este tipo de arquivo ({viewerContent?.type || 'desconhecido'}) não suporta
                  pré-visualização nativa no navegador. Faça o download para visualizá-lo.
                </p>
                <Button
                  className="h-12 px-8 font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                  onClick={() => {
                    const doc = documents?.find((d) => d.name === viewerContent?.name)
                    if (doc) handleDownload(doc)
                  }}
                >
                  <Download className="w-5 h-5 mr-2" /> Baixar Arquivo
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
