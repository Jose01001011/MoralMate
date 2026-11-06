
const RESOURCES = {
  crisis: [
    {
      name: "Namibian Police emergency line",
      contact: "10111",
      note: "If you or someone else is in danger right now.",
      verify: true
    },
    {
      name: "Nearest hospital emergency unit",
      contact: "Go in person or ask someone to take you",
      note: "If you need medical help urgently.",
      verify: false
    },
    {
      name: "NUST Student Counselling",
      contact: "Contact through official NUST Student Services channels",
      note: "Trained counsellors. It's confidential.",
      verify: true
    }
  ],
  wellbeing: [
    {
      name: "NUST Student Counselling",
      contact: "Contact through official NUST Student Services channels",
      note: "Trained counsellors. It's confidential.",
      verify: true
    },
    {
      name: "A trusted person",
      contact: "A friend, family member, mentor or class representative",
      note: "You don't have to deal with this alone.",
      verify: false
    }
  ],
  misconduct: [
    {
      name: "NUST Student Services / Dean of Students office",
      contact: "Contact through official NUST channels",
      note: "For reporting harassment, discrimination or misconduct.",
      verify: true
    },
    {
      name: "NUST Campus Security",
      contact: "Contact through official NUST channels",
      note: "If you feel unsafe on campus.",
      verify: true
    }
  ],
  privacy: [
    {
      name: "NUST Registrar / Student Records office",
      contact: "Contact through official NUST channels",
      note: "For anything to do with your records.",
      verify: true
    }
  ]
};

module.exports = { RESOURCES };
