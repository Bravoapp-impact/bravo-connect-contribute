
# Piano: Gestione dinamica ruolo-entità nel form modifica utente

## Problema Attuale
Il form di modifica utente mostra sempre il campo "Azienda", indipendentemente dal ruolo selezionato. Quando si sceglie `association_admin` per un utente che ha `company_id` valorizzato (e nessun `association_id`), il salvataggio fallisce perché viola le regole di business.

## Regole di Business
| Ruolo | Azienda (company_id) | Associazione (association_id) |
|-------|---------------------|-------------------------------|
| Dipendente | Obbligatoria | Non applicabile |
| HR Admin | Obbligatoria | Non applicabile |
| Admin Associazione | Non applicabile | Obbligatoria |
| Super Admin | Opzionale | Opzionale |

## Soluzione UI Proposta

### 1. Form Dinamico Basato sul Ruolo
Il form cambierà dinamicamente in base al ruolo selezionato:
- **Dipendente / HR Admin**: Mostra solo il campo "Azienda" (obbligatorio)
- **Admin Associazione**: Mostra solo il campo "Associazione" (obbligatorio)
- **Super Admin**: Mostra entrambi i campi (opzionali)

### 2. Comportamento al Cambio Ruolo
Quando l'utente cambia ruolo nel dropdown:
- Se passa da ruolo aziendale a `association_admin`: il campo azienda viene nascosto e pulito, appare il campo associazione
- Se passa da `association_admin` a ruolo aziendale: il campo associazione viene nascosto e pulito, appare il campo azienda
- Viene mostrato un avviso se l'utente attualmente ha un'entità associata che verrà rimossa

### 3. Validazione Pre-Salvataggio
Prima del salvataggio:
- Dipendente/HR Admin: verifica che `company_id` sia valorizzato
- Admin Associazione: verifica che `association_id` sia valorizzato
- Messaggio di errore chiaro se manca l'entità richiesta

---

## Dettagli Tecnici

### Modifiche a `UsersPage.tsx`

**1. Aggiornare l'interfaccia `EditFormData`:**
```text
interface EditFormData {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  company_id: string | null;
  association_id: string | null;  // NUOVO
}
```

**2. Fetch delle associazioni:**
Aggiungere al `fetchData()` il caricamento delle associazioni dalla tabella `associations`.

**3. Handler cambio ruolo con logica di pulizia:**
Quando il ruolo cambia:
- Se nuovo ruolo è `employee` o `hr_admin`: pulisci `association_id`, mantieni/richiedi `company_id`
- Se nuovo ruolo è `association_admin`: pulisci `company_id`, mantieni/richiedi `association_id`
- Se nuovo ruolo è `super_admin`: mantieni entrambi (opzionali)

**4. Rendering condizionale dei campi:**
```text
{/* Campo Azienda - visibile per employee, hr_admin, super_admin */}
{(editFormData.role === 'employee' || 
  editFormData.role === 'hr_admin' || 
  editFormData.role === 'super_admin') && (
  <div className="space-y-2">
    <Label>Azienda {ruoloRichiedeAzienda && '*'}</Label>
    <Select ...>
      {companies.map(...)}
    </Select>
  </div>
)}

{/* Campo Associazione - visibile per association_admin, super_admin */}
{(editFormData.role === 'association_admin' || 
  editFormData.role === 'super_admin') && (
  <div className="space-y-2">
    <Label>Associazione {ruoloRichiedeAssociazione && '*'}</Label>
    <Select ...>
      {associations.map(...)}
    </Select>
  </div>
)}
```

**5. Validazione aggiornata in `handleSaveEdit`:**
```text
// Validazione entità in base al ruolo
if (['employee', 'hr_admin'].includes(editFormData.role) && !editFormData.company_id) {
  toast.error("Seleziona un'azienda per questo ruolo");
  return;
}
if (editFormData.role === 'association_admin' && !editFormData.association_id) {
  toast.error("Seleziona un'associazione per questo ruolo");
  return;
}
```

**6. Aggiornamento profilo con entrambi i campi:**
L'update del profilo deve includere sia `company_id` che `association_id`, impostando a `null` quello non applicabile.

**7. Aggiornamento `user_tenants`:**
Sincronizzare anche la tabella `user_tenants` quando cambiano le associazioni azienda/associazione.

### Visualizzazione in Tabella
Aggiornare la colonna "Azienda" per mostrare:
- Nome azienda per employee/hr_admin
- Nome associazione per association_admin
- Entrambi o "—" per super_admin

---

## Flusso Utente Finale

1. Super Admin clicca su "Modifica" per un utente employee di TestCorp
2. Nel dialog, seleziona ruolo "Admin Associazione"
3. Il campo "Azienda" scompare e appare "Associazione" (obbligatorio)
4. Viene mostrato un avviso: "L'utente verrà rimosso da TestCorp"
5. Super Admin seleziona l'associazione dal dropdown
6. Clicca "Salva modifiche"
7. Il sistema aggiorna `company_id = null`, `association_id = [id selezionato]`, ruolo in `user_roles`, e `user_tenants`

---

## File da Modificare
- `src/pages/super-admin/UsersPage.tsx` - Logica form dinamico e validazione
