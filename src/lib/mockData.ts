import { AnalysisResult, ClaudePhotoScore } from "@/types";

export function getMockAnalysisResult(photoIds: string[]): AnalysisResult {
  const photoScores: ClaudePhotoScore[] = photoIds.map((id, i) => ({
    photoId: id,
    jawline: i === 0 ? 3 : i === 1 ? 1 : 2,
    smileEyeContact: i === 0 ? 4 : i === 1 ? 1 : 3,
    lightingSkin: i === 0 ? 2 : 1,
    background: i === 1 ? 0 : 1,
    lifestyle: i === 2 ? 1 : 0,
    subtotal: i === 0 ? 10 : i === 1 ? 4 : 7,
    feedback:
      i === 0
        ? [
            "Goed oogcontact en glimlach — dit is je sterkste foto.",
            "De achtergrond is iets rommelig; een neutrale muur vergroot de focus op jou.",
            "Goede belichting; iets meer richting een raam zou diepte toevoegen.",
          ]
        : i === 1
        ? [
            "Zonnebril verbergt je ogen — wissel voor een foto waar je ogen zichtbaar zijn.",
            "Dit lijkt een groepsfoto; solo foto's scoren 36% beter (SwipeStats data).",
            "Lage contrast belichting — probeer buiten tijdens het gouden uur.",
          ]
        : [
            "Activiteitsfoto's zijn sterk — dit toont persoonlijkheid en levensstijl.",
            "Iets wazig — zorg voor een stabiele camera voor scherpere resultaten.",
            "Voeg een echte glimlach toe om vertrouwen te verhogen.",
          ],
    feedbackDetail:
      i === 0
        ? [
            "Glimlach + oogcontact samen verklaren 49% van de aantrekkelijkheidsscore bij lachende foto's (PubMed orthodontisch onderzoek).",
            "Rommelige achtergronden verhogen cognitieve belasting, wat aantrekkelijkheid meetbaar verlaagt (iMotions theta wave studie).",
            "Egale belichting is een primair gezondheidssignaal — natural window light scoort het hoogst in meerdere studies.",
          ]
        : i === 1
        ? [
            "Ogen zijn cruciaal: vrouwen besteden de meeste kijktijd aan ogen bij het beoordelen van aantrekkelijkheid (eye-tracking studie, The Laryngoscope).",
            "Solo foto's als hoofdfoto presteren significant beter. Bij groepsfoto's moet de kijker moeite doen om jou te identificeren — dat kost cognitieve energie en leidt tot left-swipes.",
            "Goed licht onthult huidkwaliteit, wat een directe gezondheidsindicator is in evolutionair onderzoek naar aantrekkelijkheid.",
          ]
        : [
            "Activiteiten- en outdoor foto's waren de meest voorkomende eigenschap in top-scorende profielen (UOC Barcelona analyse van 1.000 Tinder profielen).",
            "Scherpte is essentieel: wazige foto's signaleren onprofessionalisme en verlagen de waargenomen kwaliteit van het profiel.",
            "Een glimlach compenseert deels lagere baseline-aantrekkelijkheid en verhoogt waargenomen betrouwbaarheid (Psychological Science).",
          ],
    enhanceable: i === 1,
  }));

  const top5 = [...photoScores].sort((a, b) => b.subtotal - a.subtotal).slice(0, 5);
  const photosTotalPts = top5.reduce((s, p) => s + p.subtotal, 0);

  return {
    photoScores,
    bioScore: {
      text: "Avontuurlijk type, altijd op zoek naar de beste koffietent in de stad ☕. Vraag me naar mijn laatste reis. Op zoek naar iemand om de stad mee te ontdekken.",
      partnerInterest: 6,
      originality: 4,
      adventurousness: 5,
      length: 5,
      noNegativity: 5,
      subtotal: 25,
      feedback: [
        "Goede opener — een vraag uitnodigen vergroot de kans op reacties aanzienlijk.",
        "\"Koffietent\" is een mild cliché; vervang door iets specifieks, bijv. je favoriete plek.",
        "Noem één concrete activiteit die je met iemand wil doen — dat is memorabeler.",
      ],
    },
    completenessScore: {
      photoCountPts: Math.min(10, photoIds.length * 2),
      bioPts: 4,
      optionalFieldsPts: 1,
      subtotal: Math.min(10, photoIds.length * 2 + 5),
    },
    photosTotalPts,
    totalScore: Math.min(100, photosTotalPts + 25 + Math.min(10, photoIds.length * 2 + 5)),
    worstPhotoIds: photoIds.length > 1 ? [photoIds[1]] : [],
  };
}
