

# Piano: Implementazione CRUD Table Pattern (Approccio Ibrido)

## Obiettivo

Creare un set di componenti riutilizzabili e un hook che:
- Riducano il boilerplate nelle pagine CRUD (~150-200 righe/pagina)
- Mantengano piena flessibilita per casi complessi
- Non rompano le pagine esistenti (refactoring opzionale)
- Permettano di aggiungere nuovi componenti in futuro

---

## Struttura File da Creare

```text
src/hooks/
  useCrudState.ts          <- Hook per stato e operazioni CRUD

src/components/crud/
  index.ts                 <- Export centralizzato
  DeleteConfirmDialog.tsx  <- Dialog eliminazione universale
  CrudTableCard.tsx        <- Card wrapper con header e search
  CrudTableActions.tsx     <- Bottoni Edit/Delete standardizzati
  CrudTableRow.tsx         <- Row wrapper con animazione
  CrudSearchBar.tsx        <- Barra ricerca con icona
  TableEmptyRow.tsx        <- Empty state per tabelle
  TableLoadingRow.tsx      <- Loading state per tabelle
```

---

## Fase 1: Componenti Base (Quick Wins)

### 1.1 DeleteConfirmDialog

Dialog di conferma eliminazione, identico in tutte le 6 pagine CRUD.

```text
Props:
  - open: boolean
  - onOpenChange: (open: boolean) => void
  - onConfirm: () => void
  - title?: string           // default: "Eliminare questo elemento?"
  - description?: string     // default: "Questa azione non puo essere annullata..."
  - entityName?: string      // es. "citta" - usato nel messaggio
  - entityLabel?: string     // es. "Milano" - nome specifico
  - confirmLabel?: string    // default: "Elimina"
  - cancelLabel?: string     // default: "Annulla"
```

Riduzione: ~25 righe per pagina

### 1.2 CrudTableActions

Bottoni Edit/Delete standardizzati per le celle azioni.

```text
Props:
  - onEdit?: () => void
  - onDelete?: () => void
  - showEdit?: boolean       // default: true
  - showDelete?: boolean     // default: true
  - size?: "sm" | "default"  // default: "sm" (h-8 w-8)
  - className?: string
```

Riduzione: ~20 righe per pagina

### 1.3 CrudTableRow

Wrapper per motion.tr con animazione standard.

```text
Props:
  - index: number            // per calcolo delay animazione
  - children: ReactNode
  - className?: string
```

Riduzione: ~5 righe per riga (moltiplicato per numero righe)

---

## Fase 2: Componenti Strutturali

### 2.1 CrudSearchBar

Barra ricerca con icona Search integrata.

```text
Props:
  - value: string
  - onChange: (value: string) => void
  - placeholder?: string     // default: "Cerca..."
  - className?: string
```

### 2.2 CrudTableCard

Card wrapper con header, conteggio, search e slot per filtri.

```text
Props:
  - title: string            // es. "12 Citta"
  - searchValue: string
  - onSearchChange: (v: string) => void
  - searchPlaceholder?: string
  - filters?: ReactNode      // slot per Select aggiuntivi
  - actions?: ReactNode      // slot per bottoni header
  - children: ReactNode      // la Table
  - className?: string
```

Riduzione: ~35 righe per pagina

### 2.3 TableEmptyRow

Empty state specifico per tabelle (usa EmptyState internamente).

```text
Props:
  - colSpan: number
  - icon?: LucideIcon
  - message?: string         // default: "Nessun elemento trovato"
  - description?: string
```

### 2.4 TableLoadingRow

Loading state specifico per tabelle.

```text
Props:
  - colSpan: number
  - message?: string         // default: "Caricamento..."
```

---

## Fase 3: Hook useCrudState

Hook generico per stato e operazioni CRUD.

```text
useCrudState<T>({
  tableName: string,
  orderBy?: { column: string, ascending?: boolean },
  searchFields?: (keyof T)[],
  fetchOnMount?: boolean,    // default: true
})

Restituisce:
  items: T[]
  loading: boolean
  searchTerm: string
  setSearchTerm: (v: string) => void
  selectedItem: T | null
  setSelectedItem: (item: T | null) => void
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  deleteDialogOpen: boolean
  setDeleteDialogOpen: (open: boolean) => void
  saving: boolean
  fetchItems: () => Promise<void>
  handleSave: (payload: Partial<T>, onSuccess?: () => void) => Promise<void>
  handleDelete: (onSuccess?: () => void) => Promise<void>
  filteredItems: T[]
```

Riduzione: ~60-80 righe per pagina

---

## Piano di Migrazione

### Pagine da Refactorare (in ordine di complessita)

| Pagina | Righe Attuali | Complessita | Ordine |
|--------|---------------|-------------|--------|
| CitiesPage | 400 | Bassa | 1 |
| CategoriesPage | 450 | Bassa | 2 |
| CompaniesPage | ~500 | Media | 3 |
| AssociationsPage | ~700 | Media | 4 |
| UsersPage | ~600 | Media | 5 |
| AccessCodesPage | 870 | Alta | 6 (opzionale) |

### Strategia

1. Creare tutti i componenti CRUD
2. Refactorare CitiesPage come proof-of-concept
3. Se funziona, procedere con le altre pagine
4. AccessCodesPage puo rimanere com'e (troppo custom) o usare solo alcuni componenti

---

## Esempio: CitiesPage Refactored

```text
// Da ~400 righe a ~180 righe

export default function CitiesPage() {
  const {
    items: cities,
    loading,
    searchTerm, setSearchTerm,
    selectedItem, setSelectedItem,
    dialogOpen, setDialogOpen,
    deleteDialogOpen, setDeleteDialogOpen,
    saving,
    handleSave,
    handleDelete,
    filteredItems,
  } = useCrudState<City>({
    tableName: "cities",
    orderBy: { column: "name" },
    searchFields: ["name", "province", "region"],
  });

  const [formData, setFormData] = useState({ name: "", province: "", region: "" });

  const handleOpenDialog = (city?: City) => {
    // ... logica form (resta custom)
  };

  return (
    <SuperAdminLayout>
      <PageHeader
        title="Citta"
        description="Gestisci le citta dove operiamo"
        actions={<Button onClick={() => handleOpenDialog()}>Nuova Citta</Button>}
      />

      <CrudTableCard
        title={`${cities.length} Citta`}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      >
        <Table>
          <TableHeader>...</TableHeader>
          <TableBody>
            {loading ? (
              <TableLoadingRow colSpan={4} />
            ) : filteredItems.length === 0 ? (
              <TableEmptyRow colSpan={4} icon={MapPin} message="Nessuna citta trovata" />
            ) : (
              filteredItems.map((city, index) => (
                <CrudTableRow key={city.id} index={index}>
                  <TableCell>...</TableCell>
                  <TableCell>
                    <CrudTableActions
                      onEdit={() => handleOpenDialog(city)}
                      onDelete={() => {
                        setSelectedItem(city);
                        setDeleteDialogOpen(true);
                      }}
                    />
                  </TableCell>
                </CrudTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CrudTableCard>

      {/* Dialog form - resta custom */}
      <Dialog>...</Dialog>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        entityName="citta"
        entityLabel={selectedItem?.name}
      />
    </SuperAdminLayout>
  );
}
```

---

## Estensibilita Futura

L'architettura permette di aggiungere facilmente:

| Componente Futuro | Come si integra |
|-------------------|-----------------|
| BulkSelectCheckbox | Nuovo componente, usato in TableCell |
| BulkActionsBar | Slot in CrudTableCard |
| ExportButton | Slot `actions` in CrudTableCard |
| InlineEditCell | Sostituisce TableCell standard |
| ColumnSorter | Nuovo componente in TableHead |
| Pagination | Nuovo componente sotto Table |

---

## Riepilogo Implementazione

| Fase | Componenti | Righe Salvate | Tempo Stimato |
|------|------------|---------------|---------------|
| 1 | DeleteConfirmDialog, CrudTableActions, CrudTableRow | ~50/pagina | Veloce |
| 2 | CrudTableCard, CrudSearchBar, TableEmptyRow, TableLoadingRow | ~45/pagina | Veloce |
| 3 | useCrudState hook | ~70/pagina | Medio |
| Refactor | Migrazione pagine | - | Incrementale |

**Totale stimato**: ~165 righe risparmiate per pagina = ~990 righe su 6 pagine

---

## Note Tecniche

- Tutti i componenti in `src/components/crud/`
- Export centralizzato via `index.ts`
- Compatibilita con componenti esistenti (`PageHeader`, `EmptyState`, `LoadingState`)
- Documentazione in `docs/design-system.md` dopo completamento
- I form restano completamente custom per massima flessibilita

