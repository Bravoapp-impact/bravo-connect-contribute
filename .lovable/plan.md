

# Miglioramento UX registrazione e email di autenticazione

Ci sono tre problemi da risolvere. Li analizzo uno per uno.

---

## 1. Pagina di conferma post-registrazione

**Problema**: Dopo la registrazione, l'utente vede solo un toast in basso a destra (facilmente ignorabile) e viene reindirizzato a una pagina che non puo' usare senza aver verificato l'email.

**Soluzione**: Invece di navigare verso la dashboard, mostrare una **pagina dedicata di conferma** con istruzioni chiare: icona email, messaggio prominente "Controlla la tua casella email", indicazione di controllare lo spam, e bottone per reinviare l'email.

### Modifiche
- **`src/pages/Register.tsx`**: Dopo `signUp` riuscito, invece di `navigate(...)`, impostare uno stato `registrationComplete = true` e mostrare una schermata di conferma a pagina intera (simile al pattern gia' usato in `ForgotPassword.tsx` con `emailSent`). Include:
  - Icona Mail grande
  - Titolo "Controlla la tua email"
  - Testo "Abbiamo inviato un link di attivazione a **{email}**. Clicca il link per completare la registrazione."
  - Nota "Non trovi l'email? Controlla la cartella spam"
  - Bottone "Reinvia email di conferma" (usa `supabase.auth.resend`)
  - Link "Torna al login"

---

## 2. Email di autenticazione in italiano e brandizzate

**Problema**: Le email di sistema (conferma registrazione, reset password) arrivano in inglese con lo stile predefinito.

**Soluzione**: Configurare email personalizzate in italiano con branding Bravo!. Per farlo serve prima configurare un dominio email nel workspace.

Il progetto ha un dominio custom (`experiences.bravoapp.it`) ma non ha ancora un dominio email configurato. Il primo passo e' configurarlo tramite il pannello email, dopodiche' possiamo creare i template personalizzati in italiano.

**Questa parte richiede un'azione da parte tua**: dovrai configurare il dominio email dal pannello che ti mostrero'. Una volta fatto, procedero' a creare i template in italiano con i colori Bravo!.

---

## 3. Recupero password per email non registrate

**Problema**: Utenti non ancora registrati provano "Password dimenticata" e non ricevono feedback utile.

**Implicazione di sicurezza**: Dire esplicitamente "questa email non e' registrata" permette a un attaccante di enumerare gli utenti della piattaforma (provare email a caso per scoprire chi e' iscritto). E' un rischio noto chiamato **user enumeration**.

**Soluzione raccomandata** (compromesso sicurezza/usabilita'): Non rivelare se l'email esiste, ma aggiungere un messaggio che guida l'utente. Nella pagina di conferma "Controlla la tua email" del forgot password, aggiungere un testo chiaro:

> "Se l'indirizzo email e' associato a un account, riceverai il link entro pochi minuti. Se non ricevi nulla, potresti non essere ancora registrato."

E aggiungere un **link "Non hai un account? Registrati"** ben visibile nella pagina di conferma.

Questo approccio:
- Non rivela se l'email esiste (sicurezza preservata)
- Guida gentilmente l'utente boomer verso la registrazione se ha sbagliato percorso
- Non richiede logica server-side aggiuntiva

### Modifiche
- **`src/pages/ForgotPassword.tsx`**: Nella sezione `emailSent`, modificare il testo per includere il suggerimento "potresti non essere ancora registrato" e aggiungere un link a `/register`.

---

## Riepilogo file modificati

| File | Cosa cambia |
|------|-------------|
| `src/pages/Register.tsx` | Pagina di conferma post-registrazione con istruzioni chiare e reinvio email |
| `src/pages/ForgotPassword.tsx` | Testo piu' chiaro + link a registrazione nella conferma |

Per le email in italiano, servira' prima configurare il dominio email (te lo mostro dopo l'implementazione delle modifiche sopra).

