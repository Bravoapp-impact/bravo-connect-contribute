## Obiettivo

Aggiungere un punto di accesso alla vista dipendente (Esperienze, Prenotazioni, Impatto) per tutti e tre i ruoli admin, senza toccare i flussi esistenti o le route protette.

## Analisi

- Le route `/app/experiences`, `/app/bookings`, `/app/impact` usano `ProtectedRoute` che controlla solo l'autenticazione (non il ruolo), quindi gli admin possono già accedervi tecnicamente.
- Il blocco è solo nell'assenza di un link/bottone nella UI admin.
- Il modo più pulito e coerente con l'esistente è aggiungere una voce nel **dropdown menu utente** in fondo alla sidebar di `AdminLayout`, che già contiene "Il mio profilo" e "Esci".

## Soluzione

Aggiungere una voce **"Esplora esperienze"** nel dropdown utente in fondo alla sidebar di `AdminLayout`, visibile per tutti e tre i ruoli admin. Un click naviga a `/app/experiences` nell'`AppLayout` standard (con la bottom navigation e il menu per mobile).

### Perché il dropdown è la scelta giusta

- Non occupa spazio nella sidebar principale (già abbastanza affollata per Super Admin).
- È già il posto dove si trova "Il mio profilo" — logicamente coerente come area delle opzioni utente.
- Non richiede nuovi componenti, solo una nuova `DropdownMenuItem`.
- Su mobile, la sidebar si apre con il hamburger menu e il dropdown è raggiungibile facilmente.

## Modifica tecnica

**File:** `src/components/layout/AdminLayout.tsx`

Nel `DropdownMenuContent`, aggiungere una nuova `DropdownMenuItem` con icona `LayoutGrid` (o `Sprout`) sopra al separatore già esistente:

```
<DropdownMenuItem
  onClick={() => navigate("/app/experiences")}
  className="cursor-pointer"
>
  <LayoutGrid className="mr-2 h-4 w-4" />
  Esplora esperienze
</DropdownMenuItem>
<DropdownMenuSeparator />
```

Il risultato nel dropdown sarà:

```
┌─────────────────────────┐
│ Il mio profilo          │
│ Esplora esperienze      │
├─────────────────────────┤
│ Esci                    │
└─────────────────────────┘
```

## File modificati

- `src/components/layout/AdminLayout.tsx` — aggiunta di una `DropdownMenuItem` nel menu utente in fondo alla sidebar (un'unica modifica, si applica automaticamente a Super Admin, HR Admin e Association Admin).