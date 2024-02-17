// Qua abbiamo raccolto gli id nell'Html
const DaysElm = document.querySelector ('#days');
const HoursElm = document.querySelector ('#hours');
const MinutesElm = document.querySelector ('#minutes');
const SecondsElm = document.querySelector ('#seconds');
const PanelElm = document.querySelector ('.panel');
// Qui abbiamo specificato la data
const EndDate = new Date("december 25 2023");
const EndDateInMs = EndDate.getTime();

// Qua abbiamo dei calcoli per trasformare i millisecondi in giorni, ore, minuti e secondi
const SecondInMs = 1000;
const MinuteInMs = 60 * SecondInMs;
const HourInMs = 60 * MinuteInMs;
const DayInMs = 24 * HourInMs;

// Qui abbiamo creato un codice per aggiornare il counter nel sito in automatico
const CounterTimer = setInterval(Timer, 1000);
function Timer () {
  // specifica della data
  const NowInMs = new Date().getTime();
  const Diff = EndDateInMs - NowInMs;
  // Qui abbiamo fatto dei calcoli per avere il numero intero dei giorni, delle ore, dei minuti e dei secondi e abbiamo usato degli innerhtml per inserire questi valori nella nostra pagina web
  // In più abbiamo aggiunto un if così che il 25 dicembre il timer si stoppa
  if (Diff > 0) {
  DaysElm.innerHTML = Math.floor (Diff/DayInMs);
  HoursElm.innerHTML = Math.floor ((Diff % DayInMs)/HourInMs);
  MinutesElm.innerHTML = Math.floor ((Diff % HourInMs)/MinuteInMs);
  SecondsElm.innerHTML = Math.floor ((Diff % MinuteInMs)/SecondInMs);
  } else {
    clearInterval(Timer);
    PanelElm.innerHTML = "<h1>Buon Natale!</h1>"
  }
}
