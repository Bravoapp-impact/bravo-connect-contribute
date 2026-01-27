import { Calendar, CalendarCheck, Users, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/common/MetricCard";

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
      color: "text-bravo-purple",
      bgColor: "bg-bravo-purple/10",
    },
    {
      label: "Eventi Futuri",
      value: futureEvents,
      icon: CalendarCheck,
      color: "text-bravo-orange",
      bgColor: "bg-bravo-orange/10",
    },
    {
      label: "Partecipazioni Totali",
      value: totalParticipations,
      icon: Users,
      color: "text-bravo-pink",
      bgColor: "bg-bravo-pink/10",
    },
    {
      label: "Tasso Medio Riempimento",
      value: `${averageFillRate}%`,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  const topRow = metrics.slice(0, 2);
  const bottomRow = metrics.slice(2);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {topRow.map((metric, index) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            icon={metric.icon}
            iconColor={metric.color}
            iconBgColor={metric.bgColor}
            animationDelay={index * 0.1}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {bottomRow.map((metric, index) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            icon={metric.icon}
            iconColor={metric.color}
            iconBgColor={metric.bgColor}
            animationDelay={(2 + index) * 0.1}
          />
        ))}
      </div>
    </div>
  );
}
