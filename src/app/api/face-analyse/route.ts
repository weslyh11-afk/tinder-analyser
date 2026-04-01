import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a QOVES Studio-level expert aesthetic facial analyst. You apply clinical, research-backed facial analysis using cephalometric principles, published academic studies, and established aesthetic science. You analyze faces with the precision of a maxillofacial surgeon — citing specific ratios, measurements, and scientific references. Respond ONLY in valid JSON — no markdown, no explanation.`;

function buildPrompt(gender: string, ageRange: string): string {
  const genderContext = gender === "Female"
    ? "Evaluate with female aesthetic ideals: neoteny (youthful features), fuller lips, smaller nose relative to face, higher cheekbones, smooth forehead, narrower jaw. Femininity score reflects how well features express female sexual dimorphism."
    : "Evaluate with male aesthetic ideals: strong jawline, prominent brow ridge, wider face, chin projection, angular features. Masculinity score reflects how well features express male sexual dimorphism (testosterone markers).";

  return `Analyze this face photo with QOVES Studio-level scientific precision. The subject is ${gender}, age range ${ageRange}.

${genderContext}

SCIENTIFIC FRAMEWORK — use these exact references in your analysis:
- FACIAL THIRDS (Rule of Thirds): Upper (hairline→brows), middle (brows→nose base), lower (nose base→chin). Ideal split: ~31%-33%-36%. A dominant lower third signals masculinity; equal thirds signal harmony. (Farkas et al., 1985)
- RULE OF FIFTHS: Face width = 5 eye widths. Interocular distance should equal one eye width. (Farkas, 1994)
- FACIAL WIDTH-TO-HEIGHT RATIO (fWHR): Bizygomatic width ÷ upper face height. Ideal range: 1.9–2.07. Higher = more dominant/masculine. (Geniole et al., 2015)
- CANTHAL TILT: Inclination of palpebral fissure. Ideal: +4° to +8°. 93% of people prefer positive canthal tilt (Bashour et al., 2007). Negative tilt = tired, droopy appearance.
- EYELID EXPOSURE: Pretarsal show (lash line to crease). Ideal: 3–6mm (Neimkin et al., 2016). Low exposure = hooded/attractive, excessive = aged.
- GONIAL ANGLE: Jaw angle. Male ideal: 110°–120° (sharp, angular). Female ideal: 120°–130° (softer). <110° = hyper-masculine; >130° = weak/feminine jaw.
- NOSE PROJECTION: Goode ratio (nasal projection ÷ nasal length). Ideal: 0.55–0.60. Nose width should align with inner eye corners (Rule of Fifths).
- LIP RATIO: Upper to lower lip ideal is 1:1.6 to 1:2 (golden ratio range). Vermillion border sharpness indicates collagen health. Mouth width should align with inner iris edges.
- CHEEKBONES: Bizygomatic width as % of face height. Ideal: 70–75% (Naini et al., 2008). Ogee curve (S-shaped highlight from cheek to undereye) indicates ideal malar projection.
- CHIN: Adequate projection = aligns with lower lip on profile view. Recession damages attractiveness more than mild protrusion. Chin-to-philtrum ratio matters for lower third harmony.
- SYMMETRY: Bilateral balance signals developmental stability and genetic health. Assessed via midline comparison. (Grammer & Thornhill, 1994)
- SKIN: Homogeneity of texture and color is the #1 skin attractiveness factor (Fink et al., 2006). Sun damage accelerates aging by 24% (Skin Cancer Foundation). Dark circle types: vascular, pigmented, structural, puffy.

Return ONLY this JSON structure:

{
  "overall_score": number (1.0-10.0),
  "first_impression": "string — what people perceive in the first 0.3-3 seconds (be specific and honest, like QOVES first impression verdicts)",
  "summary": "string — 2-3 sentence clinical assessment mentioning the strongest and weakest features",
  "categories": {
    "symmetry": {
      "score": number (1.0-10.0),
      "label": "string",
      "details": "string — assess bilateral symmetry using midline analysis. Note any asymmetries in brows, eyes, nostrils, mouth corners. Reference: symmetry signals developmental stability (Grammer & Thornhill, 1994)",
      "science": "string — the specific scientific measurement or finding (e.g. 'Left eye sits ~2mm lower than right, within normal asymmetry range')",
      "ideal": "string — what a 10/10 looks like for this category",
      "how_to_improve": "string — specific non-surgical actionable tip to improve this"
    },
    "proportions": {
      "score": number,
      "label": "string",
      "details": "string — assess facial thirds ratio (should be ~31%-33%-36%), Rule of Fifths, and fWHR (ideal 1.9-2.07). Reference: Farkas et al. 1985",
      "science": "string — estimated measurements (e.g. 'Facial thirds appear approximately 30%-35%-35%, lower third slightly short')",
      "ideal": "string — what perfect proportions look like",
      "how_to_improve": "string — specific tip"
    },
    "eyes": {
      "score": number,
      "label": "string",
      "details": "string — assess canthal tilt (ideal +4° to +8°, Bashour 2007), eyelid exposure/pretarsal show (ideal 3-6mm, Neimkin 2016), interpupillary distance, eye shape (almond ideal), limbal ring visibility, scleral health",
      "science": "string — specific findings (e.g. 'Positive canthal tilt of approximately +5°, moderate upper eyelid exposure')",
      "ideal": "string",
      "how_to_improve": "string — e.g. undereye care, lash enhancement, brow grooming to open eye area"
    },
    "nose": {
      "score": number,
      "label": "string",
      "details": "string — assess Goode ratio (ideal 0.55-0.60), nose width vs inner eye corners (Rule of Fifths), bridge straightness, tip definition, nostril show, nasofrontal angle",
      "science": "string — specific measurements",
      "ideal": "string",
      "how_to_improve": "string — non-surgical: contouring, skincare for nose pores"
    },
    "jawline": {
      "score": number,
      "label": "string",
      "details": "string — assess gonial angle (male ideal 110-120°, female 120-130°), jaw width, definition, submental region (double chin area). Reference: jaw is the most sexually dimorphic male feature",
      "science": "string — e.g. 'Gonial angle appears approximately 115°, within masculine ideal range'",
      "ideal": "string",
      "how_to_improve": "string — e.g. reduce body fat to 10-15% (reveals jawline), mewing, posture correction, gum chewing for masseter"
    },
    "lips_mouth": {
      "score": number,
      "label": "string",
      "details": "string — assess upper:lower lip ratio (ideal 1:1.6 to 1:2), vermillion border definition, cupid's bow definition, mouth width vs inner iris alignment, oral commissure angle (upturned vs downturned)",
      "science": "string — e.g. 'Lip ratio appears approximately 1:1.8, close to golden ratio ideal'",
      "ideal": "string",
      "how_to_improve": "string — e.g. lip care routine, hydration, exfoliation"
    },
    "skin": {
      "score": number,
      "label": "string",
      "details": "string — assess texture homogeneity (Fink et al. 2006), tone evenness, pore visibility, dark circles (classify type: vascular/pigmented/structural/puffy), acne/scarring, sun damage signs, under-eye skin (3x thinner than cheek skin)",
      "science": "string — specific observations about skin condition",
      "ideal": "string",
      "how_to_improve": "string — specific routine: cleanser, SPF50 daily (reduces aging 24%), retinoid at night, vitamin C serum, targeted treatment for their specific concerns"
    },
    "cheekbones": {
      "score": number,
      "label": "string",
      "details": "string — assess malar prominence, bizygomatic width as % of face height (ideal 70-75%, Naini et al. 2008), ogee curve presence (S-shaped cheek-to-undereye highlight), fat pad distribution",
      "science": "string",
      "ideal": "string",
      "how_to_improve": "string — e.g. reduce body fat to reveal cheekbones, facial exercises, strategic makeup contouring"
    },
    "chin": {
      "score": number,
      "label": "string",
      "details": "string — assess projection (should align with lower lip on profile), vertical height, shape (square vs rounded), mentolabial fold depth, chin-to-philtrum ratio",
      "science": "string",
      "ideal": "string",
      "how_to_improve": "string — e.g. posture correction, mewing for forward growth"
    },
    "facial_hair_or_grooming": {
      "score": number,
      "label": "string",
      "details": "string — assess eyebrow grooming (thickness is top 3 masculinity indicator for men), facial hair style appropriateness for bone structure, overall grooming quality, hairline framing",
      "science": "string — e.g. 'Eyebrow thickness and density signal testosterone levels; well-groomed brows frame the orbital area'",
      "ideal": "string",
      "how_to_improve": "string — specific grooming tips for their face"
    }
  },
  "strengths": ["string — be specific, reference the science", "string", "string"],
  "improvement_areas": [
    {
      "area": "string",
      "current": "string — what it looks like now with measurement",
      "target": "string — what the ideal looks like with measurement",
      "suggestion": "string — detailed non-surgical improvement plan with specific products/actions/timeline",
      "priority": "high" | "medium" | "low",
      "timeframe": "string — realistic timeframe to see improvement (e.g. '4-8 weeks for skincare, 3-6 months for body fat reduction')"
    }
  ],
  "harmony_score": number (1.0-10.0),
  "masculinity_score": number (1.0-10.0),
  "social_perception": "string — how others likely perceive this person socially (be specific: approachable? intimidating? trustworthy? etc.)",
  "what_a_10_looks_like": "string — describe exactly what this person's face would need to change to be a perfect 10/10, being realistic about bone structure limitations vs. soft tissue improvements"
}

STRICT RULES:
- All scores between 1.0 and 10.0. Be HONEST — most people score 5-7. A 10 is virtually impossible naturally.
- Labels: <4 = "Needs Work", 4–6 = "Average", 6–7.5 = "Good", 7.5–8.5 = "Great", 8.5+ = "Exceptional"
- strengths: exactly 3, each referencing specific scientific principles.
- improvement_areas: at least 4 items, ordered by priority (highest impact first). #1 priority for most people: reduce body fat to reveal bone structure.
- Every "details" field MUST reference at least one scientific study/ratio/measurement.
- Every "how_to_improve" field MUST be specific and actionable (product names, exercises, routines — not vague advice).
- Be brutally honest like QOVES. Don't sugarcoat. Scientific objectivity over feelings.
- Return ONLY the JSON object.`;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  let body: { image: string; gender: string; ageRange: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { image, gender, ageRange } = body;
  if (!image || !gender || !ageRange) {
    return NextResponse.json(
      { error: "Missing required fields: image, gender, ageRange." },
      { status: 400 }
    );
  }

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: image,
              },
            },
            {
              type: "text",
              text: buildPrompt(gender, ageRange),
            },
          ],
        },
      ],
    });

    const raw = (response.content[0] as Anthropic.TextBlock).text.trim();
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "");
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[face-analyse] error:", err);
    let message = "Analysis failed. Please try again.";
    if (err instanceof SyntaxError) {
      message = "AI returned an unexpected response. Please try again.";
    } else if (err instanceof Error) {
      if (err.message.includes("401") || err.message.includes("auth")) {
        message = "Invalid API key. Check ANTHROPIC_API_KEY.";
      } else if (
        err.message.includes("timeout") ||
        err.message.includes("ETIMEDOUT")
      ) {
        message = "Analysis took too long. Please try again.";
      }
    }
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
