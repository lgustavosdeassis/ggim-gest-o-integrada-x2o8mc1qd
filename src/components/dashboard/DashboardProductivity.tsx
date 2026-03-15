import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

const data = [
  { name: 'Seg', valor: 420 },
  { name: 'Ter', valor: 380 },
  { name: 'Qua', valor: 550 },
  { name: 'Qui', valor: 490 },
  { name: 'Sex', valor: 680 },
  { name: 'Sáb', valor: 250 },
  { name: 'Dom', valor: 180 },
]

export function DashboardProductivity() {
  return (
    <Card className="col-span-1 lg:col-span-4 border-muted/60 bg-card shadow-sm transition-all hover:border-primary/20">
      <CardHeader>
        <CardTitle className="text-xl text-primary font-bold">Produtividade Semanal</CardTitle>
        <CardDescription className="text-muted-foreground font-medium text-sm">
          Acompanhamento de tarefas, despachos e ações concluídas por dia.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            valor: {
              label: 'Ações Concluídas',
              color: 'hsl(var(--chart-2))',
            },
          }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--muted-foreground)/0.2)"
              />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                fontWeight={600}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                fontWeight={600}
              />
              <Tooltip
                content={<ChartTooltipContent className="bg-popover border-border shadow-lg" />}
              />
              <Line
                type="monotone"
                dataKey="valor"
                strokeWidth={4}
                stroke="var(--color-valor)"
                dot={{
                  fill: 'var(--color-valor)',
                  r: 5,
                  strokeWidth: 2,
                  stroke: 'hsl(var(--background))',
                }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
