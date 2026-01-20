import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CalendarCheck, Users, TrendingUp } from "lucide-react";

interface HRExperienceMetricsProps {
  activeExperiences: number;
  futureEvents: number;
  totalParticipations: number;
  averageFillRate: number;
}

export function HRExperienceMetrics({
  activeExperiences,
  futureEvents,
  totalParticipations,
  averageFillRate,
}: HRExperienceMetricsProps) {
  const metrics = [
    {
      label: "Esperienze Attive",
      value: activeExperiences,
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Eventi Futuri",
      value: futureEvents,
      icon: CalendarCheck,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      label: "Partecipazioni Totali",
      value: totalParticipations,
      icon: Users,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Tasso Medio Riempimento",
      value: `${averageFillRate}%`,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${metric.bgColor} flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-bold text-foreground truncate">
                      {metric.value}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {metric.label}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
