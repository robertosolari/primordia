# 🦠 Primordia

Un gioco web ispirato alla fase cellulare di **Spore**: sei una cellula nel brodo primordiale. Nuota, mangia, cresci ed evolvi nuove parti — finché i predatori che ti davano la caccia non cominceranno a temerti.

Costruito con [Three.js](https://threejs.org/) e [Vite](https://vitejs.dev/), senza altri framework: la fisica vive su un piano 2D, la terza dimensione è pura scenografia (nebbia, plancton in sospensione, creature che nuotano nelle profondità).

## Avvio

```bash
npm install
npm run dev      # apre su http://localhost:5173
```

Build di produzione: `npm run build` (output in `dist/`), anteprima con `npm run preview`.

## Come si gioca

- **WASD / frecce** — la cellula nuota nella direzione premuta, con inerzia.
- **Mouse** — in alternativa, la cellula segue il cursore (la tastiera ha priorità).
- **Alghe verdi** 🌿 — cibo per erbivori: danno DNA e crescita.
- **Carne rossa** 🥩 — rilasciata dalle cellule divorate, vale di più.
- **Frammenti luminosi** 💎 — token evolutivi: raccoglili per equipaggiare una parte.
- **Cuori** ❤️ — i morsi dei predatori tolgono vita; a zero vieni divorato, rinasci più piccolo ma conservi le parti (e metà del DNA).
- **Cuori pulsanti** 💗 — pickup rari nel brodo (a volte lasciati dalle cellule divorate): ripristinano una vita, o danno +5 DNA se sei già in piena salute.
- **Velocizzatori** ⚡ — fulmini dorati fluttuanti: scatto temporaneo (velocità ×1.8 per 6 secondi, la membrana brilla finché dura; raccoglierne un altro rinnova il tempo). Attenzione: **anche i predatori possono raccoglierli** — se vedi un carnivoro brillare, nuota.

Regole del brodo: puoi divorare in un boccone chi è almeno il 25% più piccolo di te; contro chi è della tua taglia serve uno **Spuntone** per combattere. I predatori più grandi di te ti inseguono… finché non cresci abbastanza da diventare tu la minaccia.

### Parti evolutive

| Parte | Effetto | Livelli |
|---|---|---|
| 〰️ Flagello | +28% velocità di nuoto | 3 |
| 🔱 Spuntone | Puoi ferire e cacciare cellule della tua taglia | 3 |
| ✳️ Ciglia | +35% manovrabilità | 3 |

## Struttura del codice

```
src/
├── main.js            Bootstrap: collega intro, overlay e game loop
├── style.css          HUD, toast e overlay (HTML/CSS puro sopra il canvas)
└── game/
    ├── Game.js        Game loop: AI, spawning, collisioni, progressione, camera
    ├── Cell.js        La cellula (giocatore e NPC): corpo, steering, HP, parti
    ├── World.js       Atmosfera: nebbia, plancton, creature di profondità, fondale
    ├── parts.js       Definizioni e mesh delle parti evolutive
    ├── materials.js   Shader della membrana (fresnel + ondulazione organica)
    └── hud.js         HUD: DNA, vita, parti, toast, schermata di morte
```

Scelte di design principali:

- **Gameplay 2D, resa 3D** — tutte le entità vivono sul piano XZ (`y = 0`); collisioni cerchio-cerchio, niente motore fisico.
- **Mondo centrato sul giocatore** — cibo e creature vengono spawnate in un anello attorno a te e rimosse quando troppo lontane: la densità resta costante ovunque nuoti.
- **AI a stati minima** — ogni NPC valuta minaccia più vicina (fuggi), preda più vicina (insegui) o cibo (bruca), in base al rapporto di taglia e alla dieta.
- **Parti in spazio unitario** — le mesh delle parti sono figlie del gruppo-cellula e scalano con la crescita del corpo.

I parametri di bilanciamento (densità di cibo e creature, raggi di spawn) sono le costanti in cima a `Game.js`.

## Roadmap

- [ ] Post-processing: depth of field e bloom per il look Spore autentico
- [ ] Editor delle parti (scegliere dove attaccarle) invece dell'auto-equip
- [ ] Audio: ambiente subacqueo, feedback di morso e crescita
- [ ] La milestone a 350 DNA diventa una vera transizione di fase
- [ ] Biomi: zone del brodo con palette, prede e pericoli diversi
