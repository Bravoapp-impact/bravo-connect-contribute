# Piano: Impatto Post-Esperienza + Sistema Feedback

## Contesto

Domani c'è la prima esperienza dal vivo. Servono due cose:

1. **I partecipanti vedano l'impatto generato** dopo l'esperienza (ore, beneficiari, SDG)
2. **Raccolta feedback** sia in-app che via email

## Stato attuale

- La pagina **Impact** (`/app/impact`) esiste ma conta le esperienze basandosi su booking `confirmed` + data passata (non su un vero stato `completed`)
- Il booking ha solo stati `confirmed` e `cancelled` — non esiste `completed`
- Non esiste tabella feedback/reviews
- Le **MyBookings** mostrano le esperienze passate nello storico ma senza CTA di feedback
- L'email di reminder esiste, ma non c'è email post-evento per chiedere feedback

## Approccio pragmatico per domani

Dato il vincolo temporale (domani è il giorno), propongo un approccio in due blocchi:

### Blocco A — Funziona subito (senza cambi architetturali)

La pagina Impact **già funziona**: filtra booking `confirmed` con data passata. Dopo domani, i partecipanti vedranno automaticamente le loro ore, beneficiari e SDG nella pagina Impatto, a patto che i campi `volunteer_hours`, `beneficiaries_count` e `sdgs` siano compilati sulla `experience_date` e sull'`experience` in database.

**Verifica necessaria**: controllare che l'esperienza di domani abbia questi dati compilati nel DB.

### Blocco B — Feedback (implementazione nuova)

#### 1. Database: tabella `experience_reviews`

```sql
CREATE TABLE experience_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  would_recommend BOOLEAN NOT NULL,
  feedback_positive TEXT,
  feedback_improvement TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id)
);
```

Con RLS policies:

- Employee inserisce solo per proprie booking passate con status `confirmed`
- Employee vede i propri feedback
- HR vede feedback anonimi dei propri dipendenti
- Association admin vede feedback anonimi delle proprie esperienze
- Super admin accesso completo

> Nota: usiamo booking `confirmed` + data passata come criterio (non `completed`) per non richiedere il cambio di lifecycle dei booking che è un lavoro architetturale più ampio della Fase 1.

#### 2. Frontend: Modal Feedback in MyBookings

Nelle **prenotazioni passate** (`pastBookings`), per ogni booking `confirmed` con data passata e senza review:

- Badge "Lascia feedback" visibile sulla card
- Click apre un **modal mobile-first** con:
  - Titolo esperienza + data (promemoria)
  - Rating 1-5 stelle (tap su stelle grandi, touch-friendly)
  - "Consiglieresti questa esperienza a qualcun altro?" toggle Si/No
  - "Cosa ti è piaciuto?" textarea opzionale
  - "Cosa poteva andare meglio?" textarea opzionale
  - Bottone "Invia feedback"
- Dopo il submit: toast di ringraziamento, badge rimosso

#### 3. Frontend: Banner su pagina Impact

Se ci sono booking completate senza feedback → qualcosa al prossimo ingresso in app che chiede all'utente di valutare l'esperienza più recente senza feedback. 

#### 4. Edge Function: Email post-evento

Nuova Edge Function `send-feedback-request` che:

- Viene invocata (manualmente o schedulata)
- Trova booking `confirmed` per eventi terminati da ~24h
- Controlla che non sia già stato inviato (via `email_logs` con tipo `feedback_request`)
- Invia email: "Ti va di raccontarci come è andata? 💜" con CTA "Lascia il tuo feedback" che punta all'app
- Stesso stile minimale delle altre email (logo piccolo, bottone nero, colori #373737/#4F4F4F)

#### 5. Config: aggiungere `verify_jwt = false` per la nuova function in `config.toml`

## File da creare/modificare


| File                                                | Azione                                                            |
| --------------------------------------------------- | ----------------------------------------------------------------- |
| Migrazione SQL                                      | Creare tabella `experience_reviews` + RLS + indici                |
| `src/components/bookings/FeedbackModal.tsx`         | Nuovo — modal feedback mobile-first                               |
| `src/pages/MyBookings.tsx`                          | Aggiungere logica feedback (query reviews, badge, apertura modal) |
| `src/components/bookings/BookingCard.tsx`           | Badge "Lascia feedback" sulle card passate                        |
| `src/pages/Impact.tsx`                              | Banner "esperienze da valutare"                                   |
| `supabase/functions/send-feedback-request/index.ts` | Nuovo — email post-evento                                         |
| `supabase/config.toml`                              | Aggiungere entry per `send-feedback-request`                      |


## Cosa NON tocchiamo ora

- Il lifecycle dei booking (`completed`, `verified`, `no_show`) — è un cambio architetturale della Fase 1 completa
- La foto nel feedback — la aggiungiamo dopo (serve bucket storage + upload)
- La vista feedback lato HR/Association — prima raccogliamo i dati, poi li mostriamo
- Il catalogo aperto / visibility — altro item di Fase 1

## Sequenza di implementazione

1. Migrazione DB (tabella + RLS)
2. FeedbackModal component
3. Aggiornamento MyBookings + BookingCard
4. Banner su Impact
5. Edge Function email + deploy  
  
  
Non rischiare di rompere il funzionamento attuale con queste modifiche in quanto l'app deve per forza funzionare domani. Piuttosto fermati se c'è qualcosa che non va