
# Piano di Miglioramento: Scalabilità, Fluidità, Sicurezza, Velocità

## Principio guida

Ogni modifica è isolata, retrocompatibile e verificabile. Le modifiche sono raggruppate in batch dal rischio più basso al più alto. I flussi esistenti non vengono mai rimossi — vengono solo migliorati in-place.

---

## BATCH 1 — Patch rapide, zero rischio regressione
Modifiche a singolo file, nessuna dipendenza tra loro.

### 1.1 Fix `console.error` in produzione
- **File:** `src/pages/Impact.tsx` riga 89
- **Modifica:** `console.error("Error fetching impact stats:", error)` → `devLog.error(...)`
- **Perché:** In produzione espone dettagli del DB. Il `devLog` già importato in altri file è la soluzione standard già in uso nel progetto.
- **Rischio regressione:** Zero. Solo il logger cambia.

### 1.2 Fix `console.error` in Experiences
- **File:** `src/pages/Experiences.tsx` riga 109
- **Modifica:** `console.error("Error fetching experiences:", error)` → `devLog.error(...)`
- **Rischio regressione:** Zero.

### 1.3 Quick Actions: `<a>` → `<Link>` nel Super Admin Dashboard
- **File:** `src/pages/super-admin/SuperAdminDashboard.tsx` righe 185-213
- **Modifica:** Sostituire i 4 tag `<a href="...">` con `<Link to="...">` di react-router-dom.
- **Perché:** `<a href>` causa un full page reload, perdendo tutto lo stato React e la sessione di Supabase in memoria. `<Link>` è una navigazione SPA istantanea.
- **Rischio regressione:** Zero. L'import di `Link` è già presente in altri layout del progetto.

### 1.4 Cap delay animazioni su liste grandi
- **File:** `src/components/experiences/ExperienceCardCompact.tsx` riga 50
- **Modifica:** `delay: index * 0.05` → `delay: Math.min(index * 0.05, 0.3)`
- **Perché:** Con 20+ esperienze l'ultima card appare dopo 1 secondo. Il cap a 0.3s è impercettibile visivamente ma elimina il ritardo eccessivo.
- **Rischio regressione:** Zero. Solo il valore numerico del delay cambia.

### 1.5 Empty state dedicato per "zero esperienze assegnate"
- **File:** `src/pages/Experiences.tsx`
- **Logica attuale:** Un unico empty state `filteredExperiences.length === 0` che appare sia quando la ricerca non trova risultati, sia quando il catalogo è vuoto ab initio.
- **Modifica:** Distinguere i due casi:
  - `experiences.length === 0` (catalogo vuoto) → messaggio "Nessuna esperienza disponibile per la tua azienda al momento. Torna a breve!"
  - `filteredExperiences.length === 0 && experiences.length > 0` (ricerca senza risultati) → messaggio esistente "Prova a modificare i criteri di ricerca"
- **Rischio regressione:** Zero. Aggiunge un branch if/else, non rimuove nulla.

### 1.6 Body scroll lock nel BaseModal (mobile)
- **File:** `src/components/common/BaseModal.tsx`
- **Modifica:** Aggiungere un `useEffect` che quando `open === true` imposta `document.body.style.overflow = 'hidden'` e lo ripristina a `''` quando il modal si chiude (cleanup dell'effect).
- **Perché:** Su iOS Safari, senza questo, il contenuto sotto la modale scorre con il dito — effetto "scroll-through" molto fastidioso su mobile.
- **Rischio regressione:** Basso. Il cleanup nell'`useEffect` garantisce il ripristino in tutti i casi (chiusura normale, navigazione, unmount).

### 1.7 ScrollToTop alla navigazione
- **File:** Nuovo `src/components/common/ScrollToTop.tsx` + `src/App.tsx`
- **Modifica:** Creare un componente `ScrollToTop` minimalista che usa `useEffect` su `location.pathname` per chiamare `window.scrollTo(0, 0)`. Inserirlo una sola volta dentro `<BrowserRouter>` in `App.tsx`.
- **Rischio regressione:** Quasi zero. Non tocca nessun componente esistente. Il `ScrollToTop` è un componente "effetto collaterale" — non renderizza nulla nel DOM.

### 1.8 Badge "Completo" su ExperienceCardCompact quando posti = 0
- **File:** `src/components/experiences/ExperienceCardCompact.tsx`
- **Modifica:** Quando `availableSpots <= 0`, aggiungere una pillola "Completo" sulla card (sovrapposta all'immagine o nel testo) e ridurre l'opacità della card a `opacity-60`. Il click rimane attivo — la selezione della data nel modal è già gestita con `disabled={isFull}`.
- **Perché:** L'utente su mobile non dovrebbe aprire il modal per scoprire che è pieno. Risparmia 2-3 tap inutili.
- **Rischio regressione:** Zero. Non disabilita il click, solo aggiunge un segnale visivo.

---

## BATCH 2 — Performance query (N+1 fix)

### 2.1 Fix N+1 in HRDashboard — Upcoming Events
- **File:** `src/pages/HRDashboard.tsx` righe 147-165
- **Problema attuale:** Per ogni evento imminente (fino a 10) viene eseguita una query separata per contare i partecipanti aziendali → fino a 10 query sequenziali.
- **Soluzione:** Raccogliere tutti gli `experience_date_id` degli eventi imminenti, poi eseguire **una sola query** `.in("experience_date_id", dateIds)` per recuperare tutte le prenotazioni rilevanti. Costruire la mappa `dateId → count` lato client.
- **Impatto:** Da N query a 1 query. Riduce il tempo di caricamento della dashboard HR da ~500-1000ms a ~50ms per la sezione eventi.
- **Rischio regressione:** Basso. La logica di filtraggio (solo utenti della stessa azienda) rimane identica, cambia solo il meccanismo di fetching.

### 2.2 Fix N+1 in ExperienceDetailModal — Confirmed Counts
- **File:** `src/components/experiences/ExperienceDetailModal.tsx` righe 76-92
- **Problema attuale:** Per ogni data disponibile viene eseguita una query separata per il count delle prenotazioni.
- **Soluzione:** Una singola query `.in("experience_date_id", dateIds).eq("status", "confirmed")` + raggruppamento lato client in una `Map<dateId, count>`.
- **Rischio regressione:** Basso. Il risultato finale è identico (count per data). Solo il meccanismo cambia.

### 2.3 Aggiunta `.limit()` alla query bookings in HRDashboard
- **File:** `src/pages/HRDashboard.tsx` riga 86
- **Modifica:** Aggiungere `.limit(1000)` alla query delle prenotazioni. Supabase ha già un cap a 1000 implicito ma è meglio esplicitarlo, e in futuro si può considerare aggregazione server-side.
- **Rischio regressione:** Zero. Cambia solo il parametro della query, non la struttura dei dati.

---

## BATCH 3 — Tipi TypeScript condivisi

### 3.1 Creare `src/types/experiences.ts`
- **File:** Nuovo `src/types/experiences.ts`
- **Contenuto:** Estrarre le interfacce `ExperienceDate` ed `Experience` che sono replicate in 6+ file identicamente.
- **File aggiornati** (solo import, nessuna modifica logica):
  - `src/pages/Experiences.tsx`
  - `src/components/experiences/ExperienceDetailModal.tsx`
  - `src/components/experiences/ExperienceCardCompact.tsx`
  - `src/components/experiences/ExperienceCard.tsx`
  - `src/components/experiences/ExperienceSection.tsx`
- **Rischio regressione:** Basso. TypeScript verifica in fase di build che i tipi siano compatibili. Se qualcosa non corrisponde, errore a compile time (non a runtime).

---

## Cosa NON è incluso in questo piano (e perché)

- **Migrazione a React Query**: Alta complessità, rischio regressione medio-alto. Richiede riscrivere i data layer di tutte le pagine employee. Da pianificare come sprint separato dopo un periodo di stabilità.
- **Refactoring ExperiencesPage.tsx (1016 righe)**: Alta complessità, rischio regressione alto data la quantità di logica interrelata (form, SDG, tag, date, upload immagini). Da affrontare separatamente con test manuali dedicati.
- **Ottimistic updates in MyBookings**: La funzione `handleCancel` è stata appena modificata (aggiunto `setSelectedBooking(null)`). Un ulteriore intervento immediato aumenta il rischio di regressione nel flusso di cancellazione.

---

## Riepilogo file modificati

```
BATCH 1 (patch rapide):
├── src/pages/Impact.tsx                           — devLog.error
├── src/pages/Experiences.tsx                      — devLog.error + empty state
├── src/pages/super-admin/SuperAdminDashboard.tsx  — <a> → <Link>
├── src/components/experiences/ExperienceCardCompact.tsx — delay cap + badge completo
├── src/components/common/BaseModal.tsx            — body scroll lock
├── src/components/common/ScrollToTop.tsx          — nuovo file
└── src/App.tsx                                    — import ScrollToTop

BATCH 2 (performance query):
├── src/pages/HRDashboard.tsx                      — N+1 fix + .limit()
└── src/components/experiences/ExperienceDetailModal.tsx — N+1 fix

BATCH 3 (tipi condivisi):
├── src/types/experiences.ts                       — nuovo file
├── src/pages/Experiences.tsx                      — import tipi
├── src/components/experiences/ExperienceDetailModal.tsx — import tipi
├── src/components/experiences/ExperienceCardCompact.tsx — import tipi
├── src/components/experiences/ExperienceCard.tsx  — import tipi
└── src/components/experiences/ExperienceSection.tsx — import tipi
```

Tutti e tre i batch possono essere eseguiti in una singola implementazione, nell'ordine specificato, in modo che se qualcosa va storto nei batch più rischiosi (2 e 3) il batch 1 sia già applicato e funzionante.
