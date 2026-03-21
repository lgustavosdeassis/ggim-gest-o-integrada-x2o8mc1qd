import { Button } from '@/components/ui/button'
import { Eye, Download, FileX, Printer, ChevronDown } from 'lucide-react'
import { Document as ActivityDocument, ActivityRecord } from '@/lib/types'
import { openDocumentViewer, downloadDocument, printDocument } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function DocumentList({
  documents,
  activity,
}: {
  documents?: ActivityDocument[]
  activity: ActivityRecord
}) {
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
          <div className="flex gap-2 mt-auto pt-3 border-t border-border/50 justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full text-xs font-bold h-8 bg-card hover:bg-muted text-foreground transition-colors flex items-center justify-center gap-1.5 px-3"
                >
                  Opções <ChevronDown className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl">
                <DropdownMenuItem
                  className="cursor-pointer font-medium flex items-center gap-2 py-2"
                  onClick={(e) => {
                    e.preventDefault()
                    openDocumentViewer(doc, activity)
                  }}
                >
                  <Eye className="w-4 h-4 text-muted-foreground" /> Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer font-medium flex items-center gap-2 py-2"
                  onClick={(e) => {
                    e.preventDefault()
                    downloadDocument(doc, activity)
                  }}
                >
                  <Download className="w-4 h-4 text-muted-foreground" /> Baixar
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer font-medium flex items-center gap-2 py-2"
                  onClick={(e) => {
                    e.preventDefault()
                    printDocument(doc, activity)
                  }}
                >
                  <Printer className="w-4 h-4 text-muted-foreground" /> Imprimir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  )
}
