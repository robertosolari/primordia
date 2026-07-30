// Integrazione Telegram Mini App (https://core.telegram.org/bots/webapps).
// Fuori da Telegram — browser normale, PWA installata, o CDN irraggiungibile
// offline — tutto qui degrada a no-op e il gioco resta identico.

let ctx = null;

export function initTelegram() {
  const tg = window.Telegram?.WebApp;
  // Lo script di Telegram espone un oggetto stub anche nel browser normale:
  // solo dentro la WebView vera initData è valorizzato.
  if (!tg || !tg.initData) return null;

  tg.ready();
  tg.expand();

  // Cornice della WebView in tinta con il brodo primordiale.
  try {
    tg.setHeaderColor('#07222b');
    tg.setBackgroundColor('#06181f');
  } catch {
    // client Telegram datato: pazienza, resta il tema di default
  }

  // Trascinare il dito verso il basso è il gesto con cui si nuota: senza
  // questi due flag chiuderebbe la Mini App a metà partita.
  if (tg.isVersionAtLeast('7.7')) tg.disableVerticalSwipes();
  if (tg.isVersionAtLeast('6.2')) tg.enableClosingConfirmation();

  ctx = { tg, user: tg.initDataUnsafe?.user ?? null };
  return ctx;
}

// Nome del giocatore Telegram, o null fuori dalla Mini App.
export function telegramUserName() {
  return ctx?.user?.first_name ?? null;
}

// Feedback aptico, percepibile solo su mobile dentro Telegram.
export function haptic(style = 'light') {
  try {
    ctx?.tg.HapticFeedback.impactOccurred(style);
  } catch {
    // versione senza supporto aptico
  }
}
