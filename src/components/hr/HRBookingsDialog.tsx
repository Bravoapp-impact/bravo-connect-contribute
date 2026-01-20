import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Calendar, Mail, Clock } from "lucide-react";

interface Booking {
  id: string;
  status: string;
  created_at: string;
  user: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

interface HRBookingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experienceTitle: string;
  dateInfo: {
    start_datetime: string;
    end_datetime: string;
    max_participants: number;
  };
  bookings: Booking[];
}

export function HRBookingsDialog({
  open,
  onOpenChange,
  experienceTitle,
  dateInfo,
  bookings,
}: HRBookingsDialogProps) {
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold pr-6">
            Prenotazioni per {experienceTitle}
          </DialogTitle>
        </DialogHeader>

        {/* Date info */}
        <div className="flex flex-wrap gap-3 py-3 border-b border-border/50">
          <Badge variant="outline" className="gap-1.5">
            <Calendar className="h-3 w-3" />
            {format(new Date(dateInfo.start_datetime), "d MMM yyyy", { locale: it })}
          </Badge>
          <Badge variant="outline" className="gap-1.5">
            <Clock className="h-3 w-3" />
            {format(new Date(dateInfo.start_datetime), "HH:mm")} -{" "}
            {format(new Date(dateInfo.end_datetime), "HH:mm")}
          </Badge>
          <Badge variant="secondary" className="gap-1.5">
            <Users className="h-3 w-3" />
            {confirmedCount}/{dateInfo.max_participants} posti
          </Badge>
        </div>

        {/* Bookings list */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          {bookings.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>Nessuna prenotazione per questa data</p>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">
                      {booking.user.first_name || "—"} {booking.user.last_name || ""}
                    </p>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{booking.user.email}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Prenotato il{" "}
                      {format(new Date(booking.created_at), "d MMM yyyy 'alle' HH:mm", {
                        locale: it,
                      })}
                    </p>
                  </div>
                  <Badge
                    variant={booking.status === "confirmed" ? "default" : "secondary"}
                    className={
                      booking.status === "confirmed"
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    }
                  >
                    {booking.status === "confirmed" ? "Confermato" : "Cancellato"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
