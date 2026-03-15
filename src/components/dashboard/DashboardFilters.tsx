import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

const INSTANCIAS = [
  'Colegiado Pleno',
  'Eventos Institucionais',
  'CMTEC AIFU',
  'CMTEC PVC',
  'CMTEC PVCCA/RP',
  'CMTEC PVCM/CMDM',
  'CMTEC TRAN/PVT',
  'CMTEC MA',
  'CMTEC AP/COMUD',
  'CMTEC ETP',
]

const EVENTOS_TIPO = [
  'Reuniões',
  'Visitas Técnicas',
  'Capacitações',
  'Seminários',
  'Treinamentos',
  'Cursos',
  'Congressos',
  'Colóquios',
  'Fóruns',
  'Webinários',
  'Palestras',
  'Apresentações',
  'Networkings',
  'Convenções',
  'Conferências',
  'Confraternizações',
  'Projetos',
  'Programas',
  'Feiras',
  'Exposições',
  'Mesas Redondas',
  'Painéis',
  'Workshops',
  'Oficinas',
  'Roadshops',
  'Campanhas',
  'Blitzes',
  'Operações',
]

export function DashboardFilters() {
  return (
    <Card>
      <CardContent className="p-4 grid gap-4 grid-cols-1 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label>Instância</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Todas as instâncias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as instâncias</SelectItem>
              {INSTANCIAS.map((i) => (
                <SelectItem key={i} value={i}>
                  {i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Tipo de Evento</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              {EVENTOS_TIPO.map((i) => (
                <SelectItem key={i} value={i}>
                  {i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Período</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Últimos 30 dias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="ano">Este ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
