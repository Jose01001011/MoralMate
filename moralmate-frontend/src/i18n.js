// Interface text in English and Afrikaans. Afrikaans drafted for the
// prototype and must be checked by a first-language speaker. Oshiwambo and
// other Namibian languages are planned but not yet translated.

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "af", label: "Afrikaans" }
];

const STRINGS = {
  en: {
    nav: { Home: "Home", "Submit Request": "Extension Request", "My Requests": "My Requests", "Staff Review": "Staff Review", About: "About" },
    greeting: "Hi! I'm MoralMate. I can help with academic and admin questions, and I'll always point you to a real person when that's the better option. What's up?",
    assistantTitle: "MoralMate Assistant",
    assistantSub: "Prototype. I'll always tell you why.",
    talkToPerson: "Talk to a person",
    newChat: "New chat",
    placeholder: "Type a message...",
    responding: "Typing...",
    why: "Why this answer?",
    principles: "Principles behind it",
    resources: "Who can help",
    suggestions: ["I need an extension for my assignment", "I have a question about my fees", "I failed a test"],
    heroTitle: "AI-Powered Student Support",
    heroText: "Get help faster. MoralMate helps with academic and admin questions, tells you why it says what it says, and sends anything sensitive straight to real people.",
    start: "Start a request",
    learn: "Learn more",
    help: "What do you need help with?",
    offline: "Can't reach MoralMate right now. Is the backend running on port 4000?",
    humanOnly: "People only",
    cards: [
      ["Academic Support", "Lectures, assessments, extensions and study guidance"],
      ["Administrative Support", "Registration, records, fees and student services"],
      ["Wellbeing Support", "Counselling, wellbeing and personal support"],
      ["Report a Concern", "Harassment, misconduct or safety-related concerns"]
    ]
  },
  af: {
    nav: { Home: "Tuis", "Submit Request": "Verlengingsversoek", "My Requests": "My Versoeke", "Staff Review": "Personeel", About: "Oor" },
    greeting: "Hallo! Ek is MoralMate, die NUST studente-ondersteuningsassistent. Ek kan help met akademiese en administratiewe vrae, en ek sal jou altyd met 'n persoon in verbinding bring wanneer dit beter vir jou is. Hoe kan ek help?",
    assistantTitle: "MoralMate Assistent",
    assistantSub: "Prototipe-assistent, verduidelik elke besluit",
    talkToPerson: "Praat met 'n persoon",
    newChat: "Nuwe gesprek",
    placeholder: "Tik jou boodskap...",
    responding: "MoralMate antwoord...",
    why: "Hoekom hierdie antwoord?",
    principles: "Etiese beginsels",
    resources: "Wie kan help",
    suggestions: ["Ek het 'n verlenging vir my opdrag nodig", "Ek het 'n vraag oor my fooie", "Ek het 'n toets gedruip"],
    heroTitle: "KI-gesteunde Studente-ondersteuning",
    heroText: "Kry vinniger die regte ondersteuning. MoralMate help met akademiese en administratiewe navrae, verduidelik sy redenasie, en verbind jou met mense vir enigiets sensitief.",
    start: "Begin 'n Versoek",
    learn: "Lees Meer",
    help: "Hoe kan ons jou vandag help?",
    offline: "Kan nie aan MoralMate koppel nie. Maak seker die agterkant loop op poort 4000.",
    humanOnly: "Slegs deur mense hanteer",
    cards: [
      ["Akademiese Ondersteuning", "Lesings, assesserings, verlengings en studieleiding"],
      ["Administratiewe Ondersteuning", "Registrasie, rekords, fooie en studentedienste"],
      ["Welstandsondersteuning", "Berading, welstand en persoonlike ondersteuning"],
      ["Rapporteer 'n Bekommernis", "Teistering, wangedrag of veiligheidsake"]
    ]
  }
};

export function strings(lang) {
  return STRINGS[lang] || STRINGS.en;
}
