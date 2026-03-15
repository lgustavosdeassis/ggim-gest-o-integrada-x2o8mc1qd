import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

const data = [
  { name: 'Sem 1', frota: 82 },
  { name: 'Sem 2', frota: 88 },
  { name: 'Sem 3', frota: 94 },
  { name: 'Sem 4', frota: 79 },
  { name: 'Sem 5', frota: 96 },
]

export function DashboardLogistics() {
  return (
    <Card className="col-span-1 lg:col-span-2 border-muted/60 bg-card shadow-sm transition-all hover:border-primary/20">
      <CardHeader>
        <CardTitle className="text-xl text-primary font-bold">Logística e Frota</CardTitle>
        <CardDescription className="text-muted-foreground font-medium text-sm">
          Disponibilidade percentual de viaturas por semana.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            frota: {
              label: 'Disponibilidade (%)',
              color: 'hsl(var(--chart-3))',
            },
          }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFrota" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-frota)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-frota)" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                tickFormatter={(value) => `${value}%`}
                fontWeight={600}
              />
              <Tooltip
                content={<ChartTooltipContent className="bg-popover border-border shadow-lg" />}
              />
              <Area
                type="monotone"
                dataKey="frota"
                stroke="var(--color-frota)"
                fillOpacity={1}
                fill="url(#colorFrota)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
