# 🦠 Primordia — Guida completa al gameplay

Tutto quello che c'è da sapere sul gioco: regole, creature, poteri, progressione. (Per l'avvio e la parte tecnica vedi il [README](README.md).)

---

## Panoramica

Sei una cellula nel brodo primordiale. L'obiettivo è **sopravvivere e crescere**: mangi per accumulare DNA, il DNA ti fa crescere di taglia, e la taglia ribalta i rapporti di forza — chi ti cacciava comincerà a fuggire da te. Lungo la strada raccogli **parti evolutive** che cambiano le tue capacità e potenziamenti temporanei.

Non ci sono livelli separati: è un mondo continuo dove la progressione è la tua stessa crescita, scandita da **soglie di DNA** (vedi [Progressione](#progressione)).

---

## Controlli

| Input | Effetto |
|---|---|
| **WASD / frecce** | Nuoti nella direzione premuta (ha priorità su tutto) |
| **Mouse** | La cellula segue il cursore |
| **Touch (mobile)** | Tocca o trascina: la cellula nuota verso il dito |
| **🔊 in alto a destra** | Attiva/disattiva l'audio (la scelta viene ricordata) |

Il gioco ha un **paesaggio sonoro completamente generativo**: ambience subacquea continua e un suono per ogni evento — bocconi, morsi, morte, rinascita, parti, cuori, fulmini e traguardi di DNA.

Il movimento ha **inerzia**: la cellula accelera, scivola e frena come in un fluido. Vicino al cursore rallenta da sola (zona morta), così puoi fermarti con precisione.

---

## La tua cellula

- Parti con **3 vite** (cuori) e taglia minima.
- **Velocità**: le cellule grandi nuotano più lente. Ogni crescita ti rende leggermente meno scattante — compensala col Flagello.
- **Taglia massima**: circa 5 volte quella iniziale; oltre non si cresce più.
- La telecamera **si allarga man mano che cresci**, per farti vedere più mondo (e più minacce).

### Vite e danni

- I morsi dei predatori più grandi tolgono **1 cuore** e ti sbalzano via.
- Dopo ogni colpo hai **1,2 secondi di invulnerabilità** (la cellula lampeggia): usali per scappare.
- Anche i colpi di Spuntone in combattimento tolgono 1 cuore.
- A **0 cuori vieni divorato** → vedi [Morte e rinascita](#morte-e-rinascita).

---

## Il DNA

Il DNA è insieme **punteggio, progressione e crescita**: ogni fonte di DNA fa anche crescere la tua taglia.

| Fonte | DNA |
|---|---|
| Alga verde 🌿 | +1 |
| Pezzo di carne 🥩 | +4 |
| Cellula divorata | +6, più un bonus proporzionale alla sua taglia (le prede grosse valgono molto di più) |
| Cuore raccolto a salute piena ❤️ | +5 |
| Token di una parte già al massimo 💎 | +8 |

Alla morte **perdi metà del DNA** accumulato.

---

## Il cibo

- **Alghe verdi** 🌿 — sparse ovunque nel brodo (circa 150 intorno a te in ogni momento, rigenerate di continuo). Sono il pasto degli erbivori: anche le creature erbranti te le contendono.
- **Carne rossa** 🥩 — non spawna da sola: la rilasciano le cellule divorate (più era grossa la vittima, più pezzi lascia). Vale 4 volte un'alga. Solo i carnivori (e tu) la mangiano.

---

## Le creature

Intorno a te nuotano sempre **circa 26 creature**, generate in proporzione alla tua taglia attuale:

| Fascia | Frequenza | Taglia rispetto a te |
|---|---|---|
| Prede | ~45% | dal 35% all'80% della tua |
| Pari | ~35% | dall'80% al 120% |
| Predatori | ~20% | dal 130% al 220% |

Questo significa che **il mondo si adatta alla tua crescita**: ci saranno sempre prede da cacciare e mostri da temere, a qualsiasi taglia.

### Diete e indole

- **Erbivori** (~55%) — brucano alghe, non attaccano mai nessuno. Fuggono dai pericoli.
- **Carnivori** (~45%) — cacciano attivamente chiunque sia sotto l'80% della loro taglia, te compreso. Circa il 60% di loro è nato con uno **Spuntone**, e il 30% di tutte le creature ha un **Flagello** (sono più veloci).

### Comportamento (in ordine di priorità)

1. **Fuga** — se una creatura pericolosa (carnivoro o tu) almeno il 25% più grande si avvicina, scappa nella direzione opposta con uno scatto di paura.
2. **Caccia** — i carnivori inseguono la preda più vicina sotto l'80% della loro taglia.
3. **Pascolo** — gli erbivori puntano l'alga più vicina.
4. **Vagabondaggio** — senza stimoli, nuotano pigramente cambiando direzione a caso.

Le creature hanno 3 vite come te e le stesse regole di caccia. Si cacciano anche **tra di loro**: capita di assistere a inseguimenti e banchetti in cui non c'entri nulla (e di approfittare della carne rimasta).

---

## Regole di caccia e combattimento

Due modi per uccidere, due soglie da ricordare:

### Divorare (boccone unico)
Se sei almeno il **25% più grande** della vittima, al contatto la inghiotti. Nessun combattimento: taglia vince. Vale anche al contrario — un predatore il 25% più grande di te ti morde al contatto (a te toglie 1 cuore per morso, non ti inghiotte subito: hai sempre una chance di fuga).

### Combattere (serve lo Spuntone)
Contro chi è **della tua taglia** (tu almeno l'80% della sua) non puoi divorare: serve uno **Spuntone**. Ogni contatto infligge 1 danno e respinge entrambi. Tre colpi e la vittima muore. Se entrambi avete lo Spuntone, colpisce chi ne ha di più.

### Bottino di una cellula uccisa
- **Carne** 🥩 in quantità proporzionale alla taglia.
- **25% di probabilità** di lasciare un token di parte 💎.
- **12% di probabilità** di lasciare un cuore 💗.

---

## I pickup

### 💎 Token delle parti
Ottaedri luminosi (colorati come la parte che contengono). Fluttuano nel brodo — massimo 3 alla volta — e cadono dalle cellule uccise. Solo tu puoi raccoglierli. La parte si equipaggia **automaticamente**; se ce l'hai già al massimo, il token si converte in +8 DNA.

### 💗 Cuori
Cuori rosa pulsanti, rari (massimo 2 nel mondo). Ripristinano **1 vita**; a salute piena danno +5 DNA. Ogni cellula divorata ha il 12% di probabilità di lasciarne uno.

### ⚡ Velocizzatori
Fulmini dorati fluttuanti (massimo 2 nel mondo). Danno **velocità ×1,8 per 6 secondi**; la membrana brilla finché lo scatto è attivo. Raccoglierne un altro durante il boost rinnova la durata.

**Attenzione: anche i predatori li raccolgono.** Un carnivoro che passa su un fulmine ottiene lo stesso scatto — lo riconosci dal bagliore della membrana, e se succede a meno di 30 unità da te ricevi un avviso. Gli erbivori invece li ignorano. Quando vedi un fulmine vicino a un predatore, decidi in fretta: lo prendi tu o giri al largo.

---

## Le parti evolutive

Tre parti, ciascuna potenziabile fino al **livello 3** (i token della stessa parte si sommano):

| Parte | Effetto per livello | Al livello 3 |
|---|---|---|
| 〰️ **Flagello** | +28% velocità | Più del doppio della velocità di base |
| 🔱 **Spuntone** | +1 attacco; sblocca il combattimento contro i pari taglia | Vinci quasi tutti gli scontri alla pari |
| ✳️ **Ciglia** | +35% manovrabilità (accelerazione e virata) | Curve fulminee, frenate immediate |

Le parti sono **visibili sul corpo**: il flagello ondeggia dietro, gli spuntoni sporgono davanti, le ciglia circondano la membrana. Anche sulle altre creature: guardale per capire cosa sanno fare prima di avvicinarti.

Le parti **non si perdono mai**, nemmeno morendo.

---

## Morte e rinascita

Quando finisci i cuori vieni divorato:

- Perdi **metà del DNA**.
- Rimpicciolisci del **30%** (mai sotto la taglia iniziale).
- **Conservi tutte le parti** equipaggiate.
- Rinasci al centro del mondo con vite piene e **3 secondi di invulnerabilità** (lampeggi).

La morte è un passo indietro, mai un azzeramento.

---

## Il mondo

- Il brodo è un'**arena circolare** enorme; avvicinandoti al bordo una corrente ti spinge dolcemente indietro (nessun muro).
- Cibo e creature esistono solo **intorno a te**: ciò che ti lasci alle spalle si dissolve e davanti a te il brodo si ripopola, sempre con le stesse densità. Non esistono zone "svuotate".
- Sotto il piano di gioco nuotano **sagome enormi e sfocate**: sono scenografia — non possono interagire con te (per ora…).

---

## Progressione

La crescita è scandita da soglie di DNA, annunciate a schermo:

| DNA | Traguardo |
|---|---|
| 30 | La cellula si rafforza — fine del tutorial implicito |
| 80 | I piccoli cominciano a temerti |
| 180 | Sei tra i grandi del brodo |
| 350 | Pronto a **lasciare il brodo** — la transizione alla fase successiva (in arrivo) |

---

## Consigli di sopravvivenza

1. **All'inizio sei preda**: mangia alghe a testa bassa e usa l'invulnerabilità post-morso per fuggire, non per insistere.
2. **Guarda le parti degli altri** prima di avvicinarti: un pari taglia con Spuntone è una rissa persa se sei disarmato.
3. **La carne è un'esca**: dove c'è un banchetto c'è stato un predatore, e probabilmente c'è ancora.
4. **Il Flagello è vita**: la velocità serve sia a cacciare che a scappare. Le Ciglia trasformano gli inseguimenti in slalom.
5. **Cuori a salute piena = banca**: +5 DNA, quindi vale sempre la pena raccoglierli.
6. **Fulmine conteso**: se un carnivoro brilla, hai 6 secondi di svantaggio — allontanati e aspetta che si spenga.
