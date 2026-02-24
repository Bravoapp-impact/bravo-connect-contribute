
# Aggiornamento colori email Bravo!

## Colori ufficiali da applicare
- **Highlight/accent**: `#8800FF` (viola Bravo!)
- **Sfondo body**: `#FAFAFA` (bianco caldo)

## Modifiche per file

### 1. `supabase/functions/send-booking-confirmation/index.ts`

| Elemento | Prima | Dopo |
|----------|-------|------|
| Header gradient | `#7c3aed` / `#a855f7` | `#8800FF` / `#aa44ff` |
| Header emoji | `Bravo! 🎉` | `Bravo!` |
| Sfondo body email | `#f9fafb` | `#FAFAFA` |
| Titolo esperienza | `color: #7c3aed` | `color: #8800FF` |
| Box data/orario sfondo | `background: #f3f4f6` | `background: #f3e8ff; border: 1px solid #d8b4fe` |

### 2. `supabase/functions/send-booking-reminders/index.ts`

| Elemento | Prima | Dopo |
|----------|-------|------|
| Header gradient | `#f97316` / `#fb923c` (arancione) | `#8800FF` / `#aa44ff` |
| Header testo | `⏰ Promemoria` | `Bravo!` + sottotitolo "Promemoria" |
| Sfondo body email | `#f9fafb` | `#FAFAFA` |
| Titolo esperienza | `color: #f97316` | `color: #8800FF` |
| Box data/orario | `background: #fff7ed; border: #fed7aa` | `background: #f3e8ff; border: #d8b4fe` |

Le Edge Functions verranno deployate automaticamente dopo la modifica.
