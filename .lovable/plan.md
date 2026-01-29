
# Piano: Fix Allineamento Mobile + Cambio Font

## Problema 1: Card Esperienze Sfondano a Sinistra

### Causa Tecnica
Il container Tailwind ha padding di `2rem` (32px), ma `ExperienceSection.tsx` usa margini negativi `-mx-4` (16px) che non compensano correttamente. Questo crea un disallineamento su mobile.

```
Container padding: 32px (2rem)
Margine negativo: -16px (-mx-4)
Risultato: prima card inizia 16px dentro al bordo sinistro
```

### Soluzione Airbnb-Style
Seguendo il pattern di Airbnb (come nello screenshot di riferimento):
- Le card rispettano il padding del container a sinistra
- Solo l'ultima card può scomparire parzialmente a destra (indica scroll)
- Margini e padding bilanciati correttamente per tutte le dimensioni

### Modifiche a ExperienceSection.tsx
Cambiare la riga 77 da:
```tsx
className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8"
```
A un approccio che usa il container width effettivo:
```tsx
className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
```

E gestire il padding a livello di layout, non con margini negativi che escono dal container.

### Approccio Alternativo (Raccomandato)
Per ottenere l'effetto "edge-to-edge" delle card che sfumano a destra (come Airbnb), dobbiamo:

1. Rimuovere la logica margini negativi/padding che non funziona
2. Usare un wrapper che va edge-to-edge con padding solo a sinistra
3. Aggiungere padding-right sull'ultimo elemento per lo spazio di "peek"

```tsx
// Container che va edge-to-edge
<div className="overflow-x-auto scrollbar-hide -mr-4 md:-mr-6 lg:-mr-8">
  <div className="flex gap-3 pr-4 md:pr-6 lg:pr-8">
    {/* cards */}
  </div>
</div>
```

Questo mantiene l'allineamento a sinistra con il container mentre permette lo scroll a destra.

---

## Problema 2: Cambio Font a Plus Jakarta Sans

### Specifiche Richieste
- Font: **Plus Jakarta Sans**
- Weight: Regular (400)
- Letter-spacing: -0.3px
- Line-height: 1.3em

### File da Modificare

**1. src/index.css**
Cambiare l'import da Outfit a Plus Jakarta Sans:
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
```

Aggiungere le specifiche tipografiche:
```css
body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  letter-spacing: -0.3px;
  line-height: 1.3em;
}
```

**2. tailwind.config.ts**
Aggiornare la font-family:
```ts
fontFamily: {
  sans: ['Plus Jakarta Sans', 'sans-serif'],
},
```

**3. Considerazioni**
- Plus Jakarta Sans supporta tutti i weights necessari (300-800)
- Il letter-spacing negativo dona un look più moderno e compatto
- Line-height 1.3em è più stretto del default (1.5), buono per UI

---

## Riepilogo Modifiche

| File | Modifica |
|------|----------|
| `src/components/experiences/ExperienceSection.tsx` | Fix margini negativi per allineamento corretto |
| `src/index.css` | Import Plus Jakarta Sans, aggiungere letter-spacing e line-height |
| `tailwind.config.ts` | Aggiornare fontFamily da Outfit a Plus Jakarta Sans |

---

## Note Tecniche

### Perche non funziona l'approccio attuale
L'approccio attuale con `-mx-4 px-4` presuppone che il container abbia un padding di 16px, ma Tailwind usa `2rem` (32px). La discrepanza crea il disallineamento.

### Pattern Airbnb
Su Airbnb mobile:
1. La prima card rispetta il margine sinistro del layout
2. L'ultima card parzialmente visibile indica contenuto scrollabile
3. Il gap tra le card e uniforme (12-16px)
4. Le card hanno larghezza fissa che permette di vedere 1.5-2 card contemporaneamente

### Font Loading
Plus Jakarta Sans e un font Google Fonts open source, caricamento via CDN senza costi aggiuntivi.
