

# Fix logo compresso nelle email

## Problema
Il tag `<Img>` in tutti i template forza `width="28" height="28"`, ma il logo non è quadrato. Risultato: immagine schiacciata.

## Soluzione
Rimuovere l'attributo `width` e mantenere solo `height="28"` in tutti gli 8 file che contengono il logo, così il browser calcola la larghezza automaticamente mantenendo l'aspect ratio.

## File da modificare (8)
1. `supabase/functions/_shared/email-templates/signup.tsx`
2. `supabase/functions/_shared/email-templates/recovery.tsx`
3. `supabase/functions/_shared/email-templates/magic-link.tsx`
4. `supabase/functions/_shared/email-templates/invite.tsx`
5. `supabase/functions/_shared/email-templates/email-change.tsx`
6. `supabase/functions/_shared/email-templates/reauthentication.tsx`
7. `supabase/functions/send-booking-confirmation/index.ts`
8. `supabase/functions/send-booking-reminders/index.ts`

Dopo le modifiche: redeploy di `auth-email-hook`, `send-booking-confirmation`, `send-booking-reminders`.

