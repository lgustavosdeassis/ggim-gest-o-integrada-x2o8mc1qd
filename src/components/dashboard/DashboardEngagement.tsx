import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

const data = [
  { name: 'Polícia Militar', value: 450, color: 'hsl(var(--chart-1))' },
  { name: 'Guarda Municipal', value: 380, color: 'hsl(var(--chart-2))' },
  { name: 'Bombeiros', value: 210, color: 'hsl(var(--chart-3))' },
  { name: 'Defesa Civil', value: 120, color: 'hsl(var(--chart-4))' },
]

export function DashboardEngagement() {
  return (
    <Card className="col-span-1 lg:col-span-2 border-muted/60 bg-card shadow-sm transition-all hover:border-primary/20">
      <CardHeader>
        <CardTitle className="text-xl text-primary font-bold">Engajamento por Força</CardTitle>
        <CardDescription className="text-muted-foreground font-medium text-sm">
          Distribuição de ocorrências atendidas por instituição.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            value: {
              label: 'Atendimentos',
            },
          }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={<ChartTooltipContent className="bg-popover border-border shadow-lg" />}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                stroke="hsl(var(--background))"
                strokeWidth={3}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
