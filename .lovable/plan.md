# Aggiornamento Design System e Email Templates

## Cosa cambia

### 1. Colori testo globali (`src/index.css`)

- `--foreground`: da `0 0% 10%` (#1a1a1a) a `0 0% 22%` (#373737) -- titoli
- `--muted-foreground`: da `0 0% 45%` (#737373) a `0 0% 31%` (#4F4F4F) -- testo normale
- `--card-foreground`: allineato a `0 0% 22%` (#373737)
- Stesso aggiornamento proporzionale per il tema dark

### 2. Bordo card e shadow (`src/index.css` + `src/components/ui/card.tsx`)

- `--border`: da `0 0% 90%` a `0 0% 81%` (#CFCFCF)
- Shadow realistica sulla Card base: traduzione dei parametri Framer (Realistic, Outside, #000 25%, X:0, Y:5, Diffusion 0.2, Focus 0.3) in CSS multi-layer: `0 1px 3px rgba(0,0,0,0.04), 0 5px 15px rgba(0,0,0,0.06)`
- Il componente `Card` in `card.tsx` sostituisce `shadow-sm` con la nuova shadow custom

### 3. Email Auth (6 template in `supabase/functions/_shared/email-templates/`)

Modifiche applicate a tutti e 6 i template (signup, recovery, magic-link, invite, email-change, reauthentication):

- **Logo piccolo** in alto a sinistra: immagine da `bravo-icon.png` caricata nel bucket `email-assets`, dimensione ~28px
- **Bottone Airbnb-style**: da `#8800FF` viola a `#222222` nero, font 14px, border-radius 8px, padding ridotto
- **Colori testo**: h1 `#373737`, body `#4F4F4F`, link `#373737` (underline), footer `#999`
- **Rimozione grassetti vivaci** nel codice di verifica: da `#8800FF` a `#373737`

### 4. Email Transazionali (2 Edge Functions)

- `**send-booking-confirmation/index.ts**`: rimozione header viola gradient, adozione stile minimale con logo piccolo, bottone nero, colori #373737/#4F4F4F, rimozione sfondo viola (#f3e8ff) dalle info-box sostituito con bordo #CFCFCF
- `**send-booking-reminders/index.ts**`: stesse modifiche del confirmation, inclusa la sezione participant_info

### 5. File modificati


| File                                 | Modifica                                              |
| ------------------------------------ | ----------------------------------------------------- |
| `src/index.css`                      | Variabili colore foreground, muted-foreground, border |
| `src/components/ui/card.tsx`         | Shadow realistica                                     |
| 6 template in `email-templates/`     | Logo, bottone nero, colori aggiornati                 |
| `send-booking-confirmation/index.ts` | HTML email redesign                                   |
| `send-booking-reminders/index.ts`    | HTML email redesign                                   |
