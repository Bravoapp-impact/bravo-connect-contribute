
# Piano: Neutralizzazione Pagine Pubbliche

## Obiettivo
Rendere le pagine di autenticazione inclusive per aziende, associazioni e individui, rimuovendo riferimenti specifici alle aziende.

---

## 1. Rimozione Homepage e Redirect a Login

**File: `src/App.tsx`**

La homepage attuale verra eliminata e la route `/` redirezionera direttamente a `/login`.

Modifiche:
- Rimuovere l'import di `Index`
- Sostituire `<Route path="/" element={<Index />} />` con un redirect:
  ```tsx
  <Route path="/" element={<Navigate to="/login" replace />} />
  ```
- Aggiungere import di `Navigate` da react-router-dom

**Nota**: Questo non causa problemi. Gli utenti che arrivano alla root verranno automaticamente portati al login. Il file `src/pages/Index.tsx` puo essere eliminato in seguito se desiderato.

---

## 2. Aggiornamento AuthLayout

**File: `src/components/auth/AuthLayout.tsx`**

| Elemento | Attuale | Nuovo |
|----------|---------|-------|
| Tagline principale | "Fai del bene, insieme alla tua azienda. Un'esperienza di volontariato alla volta." | "Bravo! è dove si crea impatto positivo. Trasformiamo la buona intenzione in azione concreta" |
| Social proof | "+2,500 dipendenti volontari" | "+1,800 persone Brave" |

---

## 3. Aggiornamento Pagina Login

**File: `src/pages/Login.tsx`**

| Elemento | Attuale | Nuovo |
|----------|---------|-------|
| Subtitle | "Accedi per scoprire le esperienze di volontariato disponibili" | "Inserisci i tuoi dati per accedere a Bravo!" |
| Placeholder email | `nome@azienda.it` | `example@domain.com` |

---

## 4. Aggiornamento Pagina Registrazione

**File: `src/pages/Register.tsx`**

| Elemento | Attuale | Nuovo |
|----------|---------|-------|
| Subtitle | "Inizia il tuo percorso di volontariato aziendale" | "Inserisci i tuoi dati per creare un account" |
| Label email | "Email aziendale" | "Email" |
| Placeholder email | `nome@azienda.it` | `example@domain.com` |
| Variabile `companyName` | Resta invariata | Rinominata in `entityName` per coerenza semantica |

Da verificare se rinominare la variabile 'companyName' in `entityName` causa problemi nei database e correggere eventuali problemi

---

## 5. Aggiornamento pagina Password Dimenticata

Modificare il placeholder email in `example@domain.com`

---

## 6. Riepilogo File Modificati

| File | Azione |
|------|--------|
| `src/App.tsx` | Redirect `/` → `/login` |
| `src/components/auth/AuthLayout.tsx` | Testi neutrali |
| `src/pages/Login.tsx` | Placeholder neutro |
| `src/pages/Register.tsx` | Subtitle, label e placeholder neutri |
| `src/pages/Index.tsx` | Opzionale: eliminazione successiva |

---

## Dettagli Tecnici

### Redirect vs Rimozione Homepage
Uso `<Navigate to="/login" replace />` invece di eliminare la route perche:
- Eventuali link esterni o bookmark alla root continueranno a funzionare
- Il redirect e trasparente per l'utente
- Il file `Index.tsx` puo essere eliminato in un secondo momento per pulizia

### Variabile `companyName` in Register
La logica interna usa `companyName` ma il sistema di access code gia supporta entita diverse (aziende, associazioni). Rinomino in `entityName` per maggiore chiarezza semantica, senza cambiare la logica.
