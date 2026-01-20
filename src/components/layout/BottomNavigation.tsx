import { Link, useLocation } from "react-router-dom";
import { Search, Calendar, Sprout, User } from "lucide-react";
import { motion } from "framer-motion";

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { path: "/app/experiences", label: "Esplora", icon: Search },
  { path: "/app/bookings", label: "Prenotazioni", icon: Calendar },
  { path: "/app/impact", label: "Impatto", icon: Sprout },
  { path: "/app/profile", label: "Profilo", icon: User },
];

export function BottomNavigation() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/50 pb-safe md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full relative py-2"
            >
              <motion.div
                className="flex flex-col items-center gap-1"
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative">
                  <Icon
                    className={`h-6 w-6 transition-colors ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
                <span
                  className={`text-[11px] font-medium transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
