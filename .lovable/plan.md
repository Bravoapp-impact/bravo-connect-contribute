
# Analisi e Unificazione Design System

## Riepilogo delle Discrepanze Trovate

Dopo aver analizzato sistematicamente tutte le pagine e i componenti dell'app, ho identificato **5 categorie di inconsistenze** rispetto al design system ufficiale.

---

## Categoria 1 — Tipografia: font e dimensioni fuori standard

Il design system prescrive una scala fissa senza breakpoint responsivi per i font. Ci sono violazioni in più punti:

**Profile.tsx (pagina employee)**
- `text-muted-foreground mt-1` sulla descrizione header → deve essere `text-[13px] text-muted-foreground`
- `text-lg font-semibold` sul nome nel card avatar → deve essere dimensione fissa, non `text-lg`
- `text-sm font-medium` e `text-sm text-muted-foreground` nella sezione "Informazioni account" → devono essere `text-[13px]`

**HRProfile.tsx (pagina HR)**
- `text-lg font-semibold` sul nome avatar → non allineato
- `text-sm font-medium` / `text-sm text-muted-foreground` nella sezione info → `text-[13px]`
- `text-xs text-primary` per la label "HR Admin" → lasciabile, ma incoerente con la scala

**HRExperienceCard.tsx**
- `text-lg leading-tight` sul titolo esperienza → non allineata con la scala tipografica unificata. Il design system non prevede `text-lg` per titoli di card admin, il titolo di sezione è `text-base font-semibold`
- `text-sm text-muted-foreground` sulla description e negli quick stats → dovrebbe essere `text-[13px]`

**UpcomingEvents.tsx**
- `text-lg` sul `CardTitle` "Prossimi Eventi" → il design system dice titolo sezione = `text-base font-semibold`. La CardTitle nativa di shadcn usa `text-2xl` di default, ma qui viene overridata a `text-lg` che è ancora fuori scala

**SDGImpactGrid.tsx**
- `text-xs font-medium uppercase` e `text-sm font-medium` e `text-base font-bold` sui dati SDG → mix di dimensioni non dalla scala ufficiale

**TopPerformersTable.tsx**
- `text-lg` (emoji medaglie) e `text-xl` → le emoji sono ok, ma testi come "Nessun dipendente..." sono `text-sm` invece di `text-[13px]`

**EmptyState.tsx (componente globale)**
- `text-lg font-medium` sul titolo → il design system dice `text-base font-semibold` per gli empty state title
- `text-sm text-muted-foreground` sulla descrizione → dovrebbe essere `text-[13px]`

**ExperienceCard.tsx (card desktop/non compatta)**
- `text-sm font-medium text-primary` per l'association name → OK come stile ma usa `text-sm` invece di `text-[13px]`
- `text-xl font-semibold` per il titolo della card → fuori dalla scala (titolo card = `text-[13px] font-medium`)
- `text-sm text-muted-foreground` per description e location → `text-[13px]`
- `text-sm` per le info data/ora → `text-[11px]`

Questa card (usata nella vista non-compatta) sembra un residuo del vecchio stile. Andrebbe allineata alla compact card o usata solo come "card espansa" con scala propria.

---

## Categoria 2 — Icone colorate: inconsistenze tra pagine

Il design system stabilisce che le icone nelle card metriche devono avere colori tematici precisi. Ci sono violazioni e incoerenze:

**SuperAdminDashboard.tsx** ✅ OK
- "Utenti" usa `text-bravo-magenta` — non previsto dal design system (che mappa Persone/Utenti → `text-bravo-purple`). Il magenta è un "accent decorativo" riservato a hero/auth.
- "Esperienze" usa `text-bravo-pink` — il design system dice Esperienze/Calendar → `text-bravo-purple`
- "Prenotazioni" usa `text-bravo-orange` con `TrendingUp` — il design system assegna TrendingUp → `text-success`

**TopPerformersTable.tsx**
- Icona `Trophy` con `text-primary` — giusto, è un'icona decorativa non metrica, `text-primary` è accettabile

**HRExperienceCard.tsx**
- `ChevronRight` con `group-hover/date:text-primary` → viola la regola "hover states sono neutri, MAI colorati"

**AssociationDashboard.tsx**
- `Calendar className="h-5 w-5 text-primary"` nel CardTitle → l'icona accanto al titolo sezione usa `text-primary` (viola), che è una scelta di stile non vietata ma non standardizzata nei titoli sezione
- N+1 query ancora presente: `Promise.all` con query separate per i count → non incluso nel batch 2 del piano precedente, rilevato adesso

---

## Categoria 3 — Card style: differenze tra aree dell'app

**Profile.tsx (employee)**
```
Card → nessuna classe aggiuntiva (usa default: "rounded-lg border bg-card shadow-sm")
```
**HRProfile.tsx / HRLayout cards**
```
Card → "border-border/50 bg-card/80 backdrop-blur-sm"
```

Il design system indica che le card nelle aree admin usano `border-border/50 bg-card/80 backdrop-blur-sm`, mentre quelle employee usano il default. Questa è una differenza **intenzionale** tra le aree, ma la pagina `Profile.tsx` employee mescola i due stili nello stesso componente (alcune card con default, senza consistenza).

---

## Categoria 4 — Hover states colorati (violazione design system)

Il design system è esplicito: **tutti gli hover devono essere neutri (grigi), MAI colorati.**

**ExperienceCardCompact.tsx e BookingCard.tsx (card future)**
```
group-hover:text-primary transition-colors  ← sul titolo
```
Viola la regola `"group-hover:text-primary sui titoli"` esplicitamente citata nel design system.

**HRExperienceCard.tsx**
```
group-hover/date:text-primary  ← sulla ChevronRight al hover
```

**UpcomingEvents.tsx**
```
hover:bg-muted/50 transition-colors  ← OK, neutro ✅
```

---

## Categoria 5 — Dimensioni icone inline: inconsistenze

Il design system prescrive:
- Icone inline card: `h-2.5 w-2.5` (10px)
- Icone metriche: `h-5 w-5` (20px) o `h-6 w-6` (24px)

**HRExperienceCard.tsx**
- `Calendar`, `Users` negli "quick stats" usano `h-4 w-4` → dovrebbero essere `h-2.5 w-2.5` per icone inline
- `Calendar`, `MapPin`, `Clock`, `Users` nel body espanso usano `h-4 w-4` → accettabile nel contesto

**UpcomingEvents.tsx**
- `CalendarDays`, `MapPin` usano `h-3 w-3` → tra i due standard, leggermente fuori
- `Users` nell'badge usa `h-3 w-3` → OK per badge

---

## Piano di Intervento (File per File)

### GRUPPO A — Tipografia (alta priorità, zero rischio)

**`src/components/common/EmptyState.tsx`**
- `text-lg font-medium` → `text-base font-semibold`
- `text-sm text-muted-foreground` → `text-[13px] text-muted-foreground`

**`src/pages/Profile.tsx`** (pagina employee)
- Header subtitle: aggiungere `text-[13px]` esplicito
- Card avatar: `text-lg font-semibold` → `text-base font-semibold`
- `text-sm font-medium` e `text-sm text-muted-foreground` → `text-[13px]`

**`src/pages/hr/HRProfile.tsx`**
- `text-lg font-semibold` → `text-base font-semibold`
- `text-sm` nelle info → `text-[13px]`

**`src/components/hr/UpcomingEvents.tsx`**
- `CardTitle text-lg` → `text-base`
- Empty state `text-muted-foreground` senza dimensione esplicita → `text-[13px]`

**`src/components/hr/SDGImpactGrid.tsx`**
- `text-xs` → `text-[10px]` (per badge/meta piccoli)
- `text-sm font-medium` → `text-[13px] font-medium`
- `text-base font-bold` sul valore ore → `text-xl font-bold` (allineato al pattern metric)

**`src/components/hr/HRExperienceCard.tsx`**
- `text-lg leading-tight` titolo → `text-base font-semibold`
- `text-sm text-muted-foreground` → `text-[13px] text-muted-foreground`
- Quick stats `text-sm` → `text-[13px]`

**`src/components/experiences/ExperienceCard.tsx`** (card non compatta)
- `text-sm font-medium text-primary` association → `text-[11px] font-medium text-muted-foreground` (allineato a ExperienceCardCompact)
- `text-xl font-semibold` titolo → `text-[13px] font-medium` (se usata in lista) oppure lasciare se è un componente "dettaglio espanso" — da verificare dove viene usata

### GRUPPO B — Icone: colori metriche (Super Admin Dashboard)

**`src/pages/super-admin/SuperAdminDashboard.tsx`**
Aggiornare il mapping colori delle metriche per allinearlo al design system:
- "Utenti": `text-bravo-magenta` / `bg-bravo-magenta/10` → `text-bravo-purple` / `bg-bravo-purple/10` (Persone = Viola)
- "Esperienze": `text-bravo-pink` / `bg-bravo-pink/10` → `text-bravo-purple` / `bg-bravo-purple/10` (Calendar/Eventi = Viola)
- "Prenotazioni" con `TrendingUp`: `text-bravo-orange` / `bg-bravo-orange/10` → `text-success` / `bg-success/10` (TrendingUp = Verde)
- Le altre (Clock = arancione, Heart = rosa) sono già corrette ✅

### GRUPPO C — Hover states colorati (design system violation)

**`src/components/experiences/ExperienceCardCompact.tsx`**
- `group-hover:text-primary` sul titolo → rimuovere (nessun cambio colore al hover)

**`src/components/bookings/BookingCard.tsx`** (card future)
- `group-hover:text-primary` sul titolo → rimuovere

**`src/components/hr/HRExperienceCard.tsx`**
- `group-hover/date:text-primary` sulla ChevronRight → `group-hover/date:text-muted-foreground`

### GRUPPO D — N+1 fix residuo (AssociationDashboard)

**`src/pages/association/AssociationDashboard.tsx`**
- Sostituire il `Promise.all` con query batch usando `.in("experience_date_id", dateIds)` — stesso pattern già applicato a HRDashboard ed ExperienceDetailModal nel batch precedente.

---

## File modificati in totale

```
GRUPPO A (tipografia):
├── src/components/common/EmptyState.tsx
├── src/pages/Profile.tsx
├── src/pages/hr/HRProfile.tsx
├── src/components/hr/UpcomingEvents.tsx
├── src/components/hr/SDGImpactGrid.tsx
├── src/components/hr/HRExperienceCard.tsx
└── src/components/experiences/ExperienceCard.tsx

GRUPPO B (icone metriche):
└── src/pages/super-admin/SuperAdminDashboard.tsx

GRUPPO C (hover states):
├── src/components/experiences/ExperienceCardCompact.tsx
├── src/components/bookings/BookingCard.tsx
└── src/components/hr/HRExperienceCard.tsx

GRUPPO D (N+1 residuo):
└── src/pages/association/AssociationDashboard.tsx
```

**Totale: 11 file.** Nessun cambio di logica, solo stile e query ottimizzazione. Rischio regressione minimo.

---

## Nota su ExperienceCard.tsx (non compatta)

Questa card usa una scala tipografica più grande (`text-xl`, `text-sm`) che suggerisce un utilizzo come "card dettaglio" o vista desktop-first diversa dalla compact. Prima di modificarla drasticamente va verificato dove è usata nel routing: se è un componente legacy raramente utilizzato, la priorità è bassa.
