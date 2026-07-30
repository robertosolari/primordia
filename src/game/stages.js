// Fasi evolutive: alle soglie di DNA il giocatore ottiene un effetto
// permanente e concreto (non solo un messaggio). Gli effetti sono
// dichiarativi qui; chi li applica è Game.applyStageEffects.
export const STAGES = [
  {
    threshold: 30,
    name: 'Cellula matura',
    message: 'La tua cellula si sente più forte… continua a mangiare! Ora puoi crescere oltre il limite iniziale. 🦠',
    radiusCap: 4.6,
  },
  {
    threshold: 80,
    name: 'Predatore navigato',
    message: 'I piccoli ora ti temono. Hai sviluppato la <b>Corazza</b> 🛡️: cercala nei token per aumentare i tuoi punti vita.',
    unlockPart: 'armor',
  },
  {
    threshold: 180,
    name: 'Dominante del brodo',
    message: 'Sei tra i grandi del brodo primordiale! La tua membrana brilla di dominanza. 🌊',
    radiusCap: 5.4,
    rimBase: 2.0,
  },
  {
    threshold: 350,
    name: 'Metamorfosi',
    message: 'Metamorfosi completata! Sei più veloce, più forte e puoi crescere ancora. 🌟',
    radiusCap: 6.2,
    rimBase: 2.6,
    statBonus: { maxSpeed: 1.1, attack: 1.15 },
  },
];
