

# Piano: Card Esperienze Edge-to-Edge + Dimensioni Ottimizzate

## Problema Identificato

Dallo screenshot si vede chiaramente lo spazio rosso inutilizzato sulla destra. Ci sono due cause:

### 1. Margine Negativo Insufficiente
- Il container ha `padding: 2rem` (32px)
- Il margine negativo attuale e `-mr-4` (16px) - solo meta
- Le card si fermano 16px prima del bordo destro

### 2. Card Troppo Larghe
- Larghezza attuale: `165px`
- Con 2 card + gap non c'e spazio sufficiente per il "peek" della terza

---

## Calcoli per iPhone 375px

```
Schermo totale: 375px
Padding sinistro: 32px
Area scroll disponibile: 375 - 32 = 343px (fino al bordo destro)

Target: 2 card complete + peek terza card

Con card da 150px e gap 10px:
150 + 10 + 150 + 10 + peek = 343px
peek = 23px (troppo poco)

Con card da 145px e gap 10px:
145 + 10 + 145 + 10 + peek = 343px  
peek = 33px (meglio, ma ancora piccolo)

Con card da 140px e gap 10px:
140 + 10 + 140 + 10 + peek = 343px
peek = 43px (buono!)
```

**Soluzione ottimale: card da 140-145px con gap 10px**

---

## Modifiche Necessarie

### File 1: `src/components/experiences/ExperienceSection.tsx`

**Problema attuale (riga 75):**
```tsx
<div className="overflow-x-auto scrollbar-hide -mr-4 md:-mr-6 lg:-mr-8">
```

**Fix:** Il margine negativo deve essere `-mr-8` (32px) per compensare completamente il padding del container:
```tsx
<div className="overflow-x-auto scrollbar-hide -mr-8">
```

E aggiornare il padding destro interno per bilanciare:
```tsx
<div className="flex gap-2.5 pr-8">
```

### File 2: `src/components/experiences/ExperienceCardCompact.tsx`

**Ridurre dimensioni card (riga 52):**
```tsx
// Da
className="... w-[165px] sm:w-[185px] md:w-[210px] ..."

// A
className="... w-[145px] sm:w-[165px] md:w-[200px] ..."
```

**Ridurre dimensioni testo:**

| Elemento | Attuale | Nuovo |
|----------|---------|-------|
| Titolo | `text-[15px]` | `text-[13px]` |
| Associazione | `text-[13px]` | `text-[11px]` |
| Data/durata | `text-[13px]` | `text-[11px]` |
| Badge | `text-xs px-3 py-1` | `text-[10px] px-2 py-0.5` |
| Logo assoc. | `w-4 h-4` | `w-3.5 h-3.5` |
| Icone | `h-3 w-3` | `h-2.5 w-2.5` |

**Ridurre spacing interno:**
```tsx
// Da
<div className="pt-3 space-y-1.5">

// A  
<div className="pt-2 space-y-1">
```

---

## Risultato Atteso su iPhone 375px

```
┌─────────────────────────────────────────┐
│ 32px │ CARD 1  │10px│ CARD 2  │10px│CA│ │
│      │  145px  │    │  145px  │    │33│ │
│      │         │    │         │    │px│ │
└─────────────────────────────────────────┘
           ↑ bordo destro schermo ────────┘
```

- Card 1: 145px (completa, allineata a sinistra con container)
- Gap: 10px
- Card 2: 145px (completa)
- Gap: 10px
- Card 3: ~33px peek (invita allo scroll)

---

## Riepilogo File da Modificare

| File | Modifica |
|------|----------|
| `src/components/experiences/ExperienceSection.tsx` | `-mr-8` per edge-to-edge, `gap-2.5`, `pr-8` |
| `src/components/experiences/ExperienceCardCompact.tsx` | `w-[145px]`, testi piu piccoli, spacing ridotto |

---

## Note Design

- Il peek di ~33px e sufficiente per indicare contenuto scrollabile
- Testi a 11-13px sono ancora leggibili su mobile (standard per caption)
- Il gap di 10px (gap-2.5) mantiene le card separate ma compatte
- Le proporzioni rimangono armoniche con l'immagine quadrata

