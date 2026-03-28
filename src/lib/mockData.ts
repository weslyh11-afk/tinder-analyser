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
        ? ["Goed oogcontact en glimlach — dit is je sterkste foto.", "De achtergrond is iets rommelig; een neutrale muur vergroot de focus.", "Goede belichting; iets meer richting een raam zou diepte toevoegen."]
        : i === 1
        ? ["Zonnebril verbergt je ogen — wissel voor een foto waar je ogen zichtbaar zijn.", "Solo foto's scoren 36% beter dan groepsfoto's als hoofdfoto (SwipeStats).", "Lage contrast belichting — probeer buiten tijdens het gouden uur."]
        : ["Activiteitsfoto's zijn sterk — dit toont persoonlijkheid.", "Iets wazig — zorg voor een stabiele camera.", "Voeg een echte glimlach toe om vertrouwen te verhogen."],
    feedbackDetail:
      i === 0
        ? ["Glimlach + oogcontact verklaren 49% van de aantrekkelijkheidsscore bij lachende foto's (PubMed).", "Rommelige achtergronden verhogen cognitieve belasting, wat aantrekkelijkheid verlaagt (iMotions).", "Natural window light scoort het hoogst als gezondheidssignaal in meerdere studies."]
        : i === 1
        ? ["Ogen zijn het meest bekeken gezichtsonderdeel bij aantrekkelijkheidsbeoordeling (eye-tracking studie).", "Groepsfoto's als hoofdfoto vereisen extra cognitieve moeite om jou te identificeren.", "Egale belichting onthult huidkwaliteit — een primaire evolutionaire gezondheidsindicator."]
        : ["Activiteiten- en outdoor foto's waren het meest voorkomend in top-profielen (UOC Barcelona).", "Scherpte signaleert professionalisme en verhoogt waargenomen kwaliteit.", "Glimlach compenseert lagere baseline-aantrekkelijkheid en verhoogt betrouwbaarheid (Psych Science)."],
    enhanceable: i === 1,
  }));

  const top5 = [...photoScores].sort((a, b) => b.subtotal - a.subtotal).slice(0, 5);
  const photosTotalPts = top5.reduce((s, p) => s + p.subtotal, 0);
  const completenessSubtotal = Math.min(10, photoIds.length * 2 + 5);

  return {
    photoScores,
    bioScore: {
      text: "Avontuurlijk type, altijd op zoek naar de beste koffietent ☕. Vraag me naar mijn laatste reis. Op zoek naar iemand om de stad mee te ontdekken.",
      partnerInterest: 6, originality: 4, adventurousness: 5, length: 5, noNegativity: 5, subtotal: 25,
      feedback: [
        "Goede opener — een vraag uitnodigen vergroot de kans op reacties.",
        "\"Koffietent\" is een licht cliché; vervang door iets specifieks, bijv. je favoriete plek.",
        "Noem één concrete activiteit die je met iemand wil doen — dat is memorabeler.",
      ],
    },
    vibe: {
      vibeLabel: "Avontuurlijk & Toegankelijk",
      vibeEmoji: "🌍",
      vibeScore: 7,
      vibeDescription: "Je profiel straalt een ontspannen, avontuurlijke energie uit die uitnodigend aanvoelt. Er zit persoonlijkheid in, maar het potentieel wordt nog niet volledig benut — meer specifieke details zouden de vibe nog sterker maken.",
      unintendedSignals: [
        "Je tweede foto (zonnebril + groep) signaleert onbewust dat je misschien iets te verbergen hebt — mensen die ogen niet kunnen zien vertrouwen minder snel.",
        "De herhaling van het woord 'avontuur' in je bio klinkt als een cliché dat iedereen gebruikt, waardoor je juist minder avontuurlijk overkomt.",
        "Geen enkele foto toont je thuis of in een vertrouwde omgeving — dit kan het beeld geven dat je moeilijk te 'bereiken' bent.",
      ],
      conversationHooks: [
        "☕ De mysterieuze koffietent: \"Welke koffietent zoek je nog steeds?\" — een perfecte opener die om specificiteit vraagt.",
        "✈️ De laatste reis: Je vraagt er zelf om — dit is een uitstekende gespreksstarter die je activiteit foto ondersteunt.",
        "🏙️ Stad ontdekken: Dit is concreet genoeg om een afspraak van te maken — slimme manier om intentie te tonen.",
      ],
      firstImpression: {
        verdict: "Stopper",
        score: 8,
        reasoning: "Goede glimlach en direct oogcontact houden de aandacht vast in de eerste 0.3 seconden. De belichting is goed en je gezicht is duidelijk zichtbaar — de twee meest kritieke factoren voor een sterke hoofdfoto.",
      },
    },
    completenessScore: {
      photoCountPts: Math.min(10, photoIds.length * 2),
      bioPts: 4,
      optionalFieldsPts: 1,
      subtotal: completenessSubtotal,
    },
    photosTotalPts,
    totalScore: Math.min(100, photosTotalPts + 25 + completenessSubtotal),
    worstPhotoIds: photoIds.length > 1 ? [photoIds[1]] : [],
  };
}
