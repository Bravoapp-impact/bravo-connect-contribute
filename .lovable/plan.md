

# Informazioni utili editabili per esperienza

## Situazione attuale
Le "Informazioni utili" che l'utente vede nel dettaglio prenotazione sono **generate automaticamente dal codice** in base alla categoria dell'esperienza (es. "ambiente" -> "Porta scarpe chiuse", "sociale" -> "Abbigliamento casual"). Non esiste un campo nel database per personalizzarle, quindi non compaiono nel form di creazione.

## Cosa cambia

### 1. Nuovo campo nel database
Aggiunta di una colonna `participant_info` (testo libero, opzionale) alla tabella `experiences`, dove il Super Admin o l'associazione possono scrivere indicazioni specifiche per i partecipanti.

### 2. Form di creazione/modifica esperienza
Un nuovo campo "Informazioni per i partecipanti" nel form del Super Admin (`ExperiencesPage.tsx`), con un textarea e un placeholder esplicativo (es. "Cosa portare, come vestirsi, dove trovarsi...").

### 3. Visualizzazione nel dettaglio prenotazione
Nel `BookingDetailModal.tsx`, se l'esperienza ha un testo `participant_info` personalizzato, viene mostrato quello. Se il campo e' vuoto, restano i consigli generici basati sulla categoria (come ora).

### 4. Email di reminder
Il template HTML nella Edge Function `send-booking-reminders` includera' una sezione "Informazioni utili" con il contenuto di `participant_info`, se presente. In questo modo il partecipante riceve le indicazioni pratiche direttamente nella mail il giorno prima.

### 5. Propagazione del campo
- Aggiornamento del tipo `Experience` centralizzato in `src/types/experiences.ts`
- Aggiornamento delle query che caricano le esperienze per includere il nuovo campo dove necessario

## Dettagli tecnici

### Database migration
```sql
ALTER TABLE public.experiences 
ADD COLUMN participant_info text DEFAULT NULL;
```

### File modificati
- **`src/pages/super-admin/ExperiencesPage.tsx`** -- aggiunta campo `participant_info` a formData, payload di salvataggio e UI del form (textarea dopo descrizione)
- **`src/types/experiences.ts`** -- aggiunta `participant_info?: string | null` all'interfaccia `Experience`
- **`src/components/bookings/BookingDetailModal.tsx`** -- aggiunta `participant_info` all'interfaccia props; se presente, mostra il testo custom al posto dei tips generici
- **`src/components/experiences/ExperienceDetailModal.tsx`** -- mostra `participant_info` nel dettaglio esperienza (se presente)
- **`src/pages/Experiences.tsx`** -- includi `participant_info` nella query fetch
- **`supabase/functions/send-booking-reminders/index.ts`** -- aggiunta sezione "Informazioni utili" nell'HTML dell'email se `participant_info` e' valorizzato; il campo viene letto tramite la join con `experiences`
- **`src/pages/MyBookings.tsx`** -- propagazione del campo `participant_info` nella query delle prenotazioni per passarlo al BookingDetailModal
