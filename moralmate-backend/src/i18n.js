// Agent phrases in English and Afrikaans.
// The Afrikaans text was drafted for the prototype and must be checked by a
// first-language speaker. Oshiwambo, Otjiherero and other Namibian languages
// are not yet translated: this is a documented limitation.

const STRINGS = {
  en: {
    clarifyAcademic: "Sure. What's it about? An assignment extension, a test or exam result, or something for your lecturer?",
    clarifyAdmin: "Okay. Is it registration, fees, records, accommodation, or something else?",
    clarifyAgain: "Sorry, I'm still not quite following. Can you put it in one sentence? Or I can point you to a person.",
    clarifyGiveUp: "I'd rather not guess on this one. Your best bet is to talk to someone at NUST Student Services.",
    handoff: "No problem. You can reach a person at NUST Student Services through the official channels. I haven't sent anything anywhere, so you decide what to share.",
    lockedEscalation: "I've handed this chat over to people, so I won't reply automatically here. Please use the contacts below. You can start a new chat any time.",
    extStart: "I can do a quick pre-check on an extension. Just a few questions, and you can say \"not sure\" to any of them. Your lecturer always makes the final call.",
    askReason: "What's the main reason you need more time?",
    askDocumentation: "Do you have something to back it up? Like a medical certificate, a funeral programme, or proof of the tech problem.",
    askDays: "How many extra days do you need?",
    askTiming: "Has the deadline already passed?",
    assessed: "Okay, here's what I found.",
    saved: id => `Saved! Your request number is ${id}. You can check on it, ask for a review or contest it under "My Requests".`,
    nothingToSave: "There's nothing to save yet. Let's do the extension check first.",
    restart: "Fresh start. What can I help with?"
  },
  af: {
    clarifyAcademic: "Dankie. Waaroor gaan die akademiese saak? Byvoorbeeld 'n verlenging vir 'n opdrag, 'n toets- of eksamenuitslag, of 'n vraag vir jou dosent.",
    clarifyAdmin: "Dankie. Gaan dit oor registrasie, fooie, jou rekords, akkommodasie of iets anders administratief?",
    clarifyAgain: "Ek is nog nie seker ek verstaan nie. Kan jy dit in een sin beskryf, of verkies jy om met 'n persoon te praat?",
    clarifyGiveUp: "Ek wil nie raai oor iets wat vir jou belangrik is nie. Die beste volgende stap is om met 'n persoon by NUST Studentedienste te praat.",
    handoff: "Natuurlik. Jy kan met 'n persoon by NUST Studentedienste praat deur die amptelike universiteitskanale. MoralMate het niks aangestuur nie; jy besluit wat jy deel.",
    lockedEscalation: "Hierdie gesprek is na menslike ondersteuning oorgedra, so MoralMate sal nie hier outomaties antwoord nie. Gebruik asseblief die kontakte hieronder. Jy kan enige tyd 'n nuwe gesprek begin.",
    extStart: "Ek kan 'n versoek vir 'n verlenging vooraf beoordeel. Ek sal tot vier kort vrae vra, en jou dosent neem altyd die finale besluit. Jy kan \"nie seker nie\" antwoord.",
    askReason: "Wat is die hoofrede waarom jy meer tyd nodig het?",
    askDocumentation: "Het jy 'n stawende dokument, soos 'n mediese sertifikaat, 'n begrafnisprogram of bewys van die tegniese probleem?",
    askDays: "Hoeveel ekstra dae vra jy?",
    askTiming: "Het die sperdatum reeds verbygegaan?",
    assessed: "Hier is die voorlopige beoordeling.",
    saved: id => `Gestoor as versoek ${id}. Jy kan dit volg, betwis of menslike hersiening vra onder "My Versoeke".`,
    nothingToSave: "Daar is nog geen beoordeelde versoek om te stoor nie.",
    restart: "Ons begin weer. Hoe kan ek jou vandag help?"
  }
};

const ESCALATION_AF = {
  safety: {
    response: "Ek is bekommerd oor jou veiligheid. MoralMate kan nie self hiermee help nie, en sal dit nie probeer nie. As jy in onmiddellike gevaar is, kontak nou nooddienste. Kontak asseblief een van die mense hieronder.",
    explanation: "Jou boodskap noem iets wat jou veiligheid kan raak. Veiligheid kom altyd eerste, so slegs mense hanteer dit."
  },
  misconduct: {
    response: "Dankie dat jy dit aanmeld. Klagtes oor teistering, diskriminasie of wangedrag word slegs deur opgeleide personeel hanteer. MoralMate sal dit nie beoordeel of advies gee nie.",
    explanation: "Jou boodskap beskryf moontlik wangedrag of teistering. 'n Persoon moet dit hersien."
  },
  wellbeing: {
    response: "Dit klink of jy deur 'n moeilike tyd gaan. 'n Persoon behoort jou hiermee te help, nie 'n outomatiese assistent nie. Jy kan die ondersteuning hieronder kontak wanneer jy gereed is.",
    explanation: "Jou boodskap noem jou welstand. Slegs gekwalifiseerde mense hanteer welstandsake."
  }
};

const OPTIONS = {
  en: {
    reason: ["Medical", "Bereavement", "Technical problem", "Personal or work", "University activity"],
    documentation: ["Yes, I have a document", "No document", "Not sure"],
    days: ["1 day", "3 days", "5 days", "7 days", "More than 7 days"],
    timing: ["No, not yet", "Yes, it has passed"],
    afterAssessment: ["Save this request", "Talk to a person", "Start again"],
    human: ["Talk to a person now"]
  },
  af: {
    reason: ["Medies", "Sterfgeval", "Tegniese probleem", "Persoonlik of werk", "Universiteitsaktiwiteit"],
    documentation: ["Ja, ek het 'n dokument", "Geen dokument", "Nie seker nie"],
    days: ["1 dag", "3 dae", "5 dae", "7 dae", "Meer as 7 dae"],
    timing: ["Nee, nog nie", "Ja, dit is verby"],
    afterAssessment: ["Stoor hierdie versoek", "Praat met 'n persoon", "Begin weer"],
    human: ["Praat nou met 'n persoon"]
  }
};

function t(lang) {
  return STRINGS[lang] || STRINGS.en;
}

module.exports = { t, STRINGS, ESCALATION_AF, OPTIONS };
