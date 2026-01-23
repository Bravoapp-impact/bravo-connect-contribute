import { motion } from "framer-motion";
import { Clock, UserCheck, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface EmployeeStats {
  id: string;
  total_experiences: number;
  total_hours: number;
}

interface MonthlyData {
  month: string;
  count: number;
}

interface EmployeeMetricsCardsProps {
  employees: EmployeeStats[];
  monthlyTrend: MonthlyData[];
}

export function EmployeeMetricsCards({
  employees,
  monthlyTrend,
}: EmployeeMetricsCardsProps) {
  // Calculate metrics
  const activeEmployees = employees.filter((e) => e.total_experiences > 0);
  const totalHours = employees.reduce((sum, e) => sum + e.total_hours, 0);

  const avgHoursPerEmployee =
    activeEmployees.length > 0
      ? (totalHours / activeEmployees.length).toFixed(1)
      : "0";

  const activePercentage =
    employees.length > 0
      ? Math.round((activeEmployees.length / employees.length) * 100)
      : 0;

  // Get current month trend indicator
  const currentMonthCount = monthlyTrend[monthlyTrend.length - 1]?.count || 0;
  const previousMonthCount = monthlyTrend[monthlyTrend.length - 2]?.count || 0;
  const trendDirection =
    currentMonthCount >= previousMonthCount ? "up" : "down";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Ore Medie per Dipendente */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground truncate">
                  Ore medie / dipendente
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {avgHoursPerEmployee}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    h
                  </span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Calcolato su {activeEmployees.length} dipendenti attivi
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Percentuale Dipendenti Attivi */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground truncate">
                  Dipendenti attivi
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {activePercentage}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    %
                  </span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {activeEmployees.length} su {employees.length} dipendenti
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Trend Mensile */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground truncate">
                  Trend partecipazioni
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ultimi 3 mesi
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  trendDirection === "up"
                    ? "bg-primary/10"
                    : "bg-destructive/10"
                }`}
              >
                <TrendingUp
                  className={`h-5 w-5 ${
                    trendDirection === "up"
                      ? "text-primary"
                      : "text-destructive rotate-180"
                  }`}
                />
              </div>
            </div>

            {monthlyTrend.length > 0 ? (
              <div className="h-16 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrend} barCategoryGap="20%">
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {monthlyTrend.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            index === monthlyTrend.length - 1
                              ? "hsl(var(--primary))"
                              : "hsl(var(--muted))"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Nessun dato disponibile
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
