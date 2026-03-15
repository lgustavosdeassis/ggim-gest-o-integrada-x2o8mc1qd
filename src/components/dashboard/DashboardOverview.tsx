import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

const data = [
  { name: 'Jan', total: 1200 },
  { name: 'Fev', total: 1900 },
  { name: 'Mar', total: 1500 },
  { name: 'Abr', total: 2200 },
  { name: 'Mai', total: 2800 },
  { name: 'Jun', total: 2400 },
  { name: 'Jul', total: 3100 },
  { name: 'Ago', total: 2900 },
  { name: 'Set', total: 3400 },
  { name: 'Out', total: 3800 },
  { name: 'Nov', total: 3200 },
  { name: 'Dez', total: 4100 },
]

export function DashboardOverview() {
  return (
    <Card className="col-span-1 lg:col-span-4 border-muted/60 bg-card shadow-sm transition-all hover:border-primary/20">
      <CardHeader>
        <CardTitle className="text-xl text-primary font-bold">Visão Geral Anual</CardTitle>
        <CardDescription className="text-muted-foreground font-medium text-sm">
          Consolidação de ocorrências e atividades registradas ao longo do ano.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer
          config={{
            total: {
              label: 'Ocorrências',
              color: 'hsl(var(--chart-1))',
            },
          }}
          className="h-[350px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
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
                cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                content={<ChartTooltipContent className="bg-popover border-border shadow-lg" />}
              />
              <Bar
                dataKey="total"
                fill="var(--color-total)"
                radius={[4, 4, 0, 0]}
                className="transition-all duration-300 hover:opacity-80"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
