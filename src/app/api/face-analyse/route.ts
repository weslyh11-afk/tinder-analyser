import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a QOVES Studio-level expert aesthetic facial analyst. You apply clinical, research-backed facial analysis using cephalometric principles, published academic studies, and established aesthetic science. You analyze faces with the precision of a maxillofacial surgeon — citing specific ratios, measurements, and scientific references. You provide the same depth as a QOVES Comprehensive Aesthetics Report: sexual dimorphism analysis, facial averageness, symmetry scoring, face shape, and a full feature-by-feature breakdown with protocol recommendations. Respond ONLY in valid JSON — no markdown, no explanation.`;

function buildPrompt(gender: string, ageRange: string): string {
  const genderLabel = gender === "Female" ? "female" : "male";
  const dimorphismLabel = gender === "Female" ? "femininity" : "masculinity";

  return `Analyze this face photo with QOVES Studio Comprehensive Report-level precision. The subject is ${gender}, age range ${ageRange}.

SCIENTIFIC FRAMEWORK (cite these in your analysis):
- FACIAL THIRDS: Upper (hairline-brows), middle (brows-nose base), lower (nose base-chin). Ideal: ~31%-33%-36%. (Farkas et al., 1985)
- RULE OF FIFTHS: Face width = 5 eye widths. Interocular distance = 1 eye width. (Farkas, 1994)
- fWHR: Bizygomatic width / upper face height. Ideal: 1.9-2.07. (Geniole et al., 2015)
- CANTHAL TILT: Ideal: +4 to +8 degrees. 93% prefer positive tilt. (Bashour et al., 2007)
- EYELID EXPOSURE: Pretarsal show ideal 3-6mm. (Neimkin et al., 2016; Vaca et al., 2019)
- GONIAL ANGLE: Male ideal 110-120 degrees, female 120-130 degrees.
- GOODE RATIO (nose): Nasal projection / nasal length. Ideal: 0.55-0.60.
- LIP RATIO: Upper:lower ideal 1:1.6 to 1:2. Mouth width aligns with inner iris.
- CHEEKBONES: Bizygomatic width 70-75% of face height. (Naini et al., 2008). Ogee curve = ideal malar projection.
- SYMMETRY: Midline flip comparison. Signals developmental stability. (Grammer & Thornhill, 1994)
- SKIN: Homogeneity is #1 factor. (Fink et al., 2006). SPF reduces aging 24%.
- SEXUAL DIMORPHISM: Averageness + ${dimorphismLabel} = attractive. (Rhodes et al.) Male: strong jaw, brow ridge, wider face, chin projection. Female: neoteny, fuller lips, smaller nose, higher cheekbones.
- AVERAGENESS: Faces closer to population mean signal genetic diversity and health. Unique/distinctive features can enhance appeal if harmonious.

Return ONLY this JSON structure:

{
  "aesthetic_score": number (0-100, like QOVES — represents how close to YOUR personal beauty potential, NOT absolute ranking. 74 = good with room for glow-up),
  "overall_score": number (1.0-10.0),
  "first_impression": "string — what people perceive in the first 0.3-3 seconds, be specific and honest",
  "summary": "string — 2-3 sentence clinical assessment like a QOVES report opening letter",

  "sexual_dimorphism": {
    "score": number (1.0-10.0, how ${genderLabel} the face reads),
    "range": "string — e.g. 'predominantly masculine' or 'slightly feminine' or 'androgynous'",
    "details": "string — describe which features read as masculine vs feminine. Example from QOVES: 'Overall, your face is predominantly masculine with low-set, straight, deep-set eyes, a strong square chin, and a lean defined lower third. Some features lean slightly towards the feminine side, such as wide outward-facing cheekbones and a smaller, more delicate nose.'",
    "masculine_traits": ["string — list specific masculine features observed"],
    "feminine_traits": ["string — list specific feminine features observed"]
  },

  "facial_averageness": {
    "score": number (0-100, where 0 = highly unique/distinctive, 100 = perfectly average. QOVES example: 20/100 = slightly unique),
    "details": "string — describe which features are distinctive vs average for their demographic"
  },

  "facial_symmetry": {
    "score": number (0-100, QOVES example: 88/100 = highly symmetric),
    "details": "string — assess bilateral balance, note specific asymmetries if any"
  },

  "face_shape": {
    "shape": "string — one of: oval, round, square, oblong, heart, diamond, triangle",
    "midface_width": "string — narrow, normal, or wide",
    "forehead_width": "string — narrow, normal, or wide",
    "lower_third_width": "string — narrow, normal, or wide",
    "facial_length": "string — short, average, or long",
    "details": "string — explain the face shape and what hairstyles/grooming work best for it"
  },

  "categories": {
    "eyebrows": {
      "score": number (1.0-10.0),
      "label": "string",
      "dimorphism": "string — masculine, feminine, or neutral",
      "details": "string — assess thickness (top 3 masculinity indicator), set height, arch, density, symmetry, tail length",
      "science": "string — specific observation",
      "ideal": "string — what 10/10 looks like",
      "how_to_improve": "string — e.g. 'Use brow gel to make them look darker and fuller. If sparse, apply minoxidil 3% to stimulate growth. Maintain thickness, avoid over-plucking.'"
    },
    "eyes": {
      "score": number,
      "label": "string",
      "dimorphism": "string",
      "details": "string — assess canthal tilt, eyelid exposure (hooded vs exposed), eye shape, scleral health/redness, limbal ring, under-eye (tear trough hollows, dark circles — classify type), iris color note",
      "science": "string — e.g. 'Hooded, sharp, angled eyes with positive tilt and straight upper lids creating a piercing alert gaze'",
      "ideal": "string",
      "how_to_improve": "string — e.g. 'Use Brimonidine eye drops to reduce redness and yellowing. Apply hyaluronic acid under-eye serum to brighten and plump tear trough hollows.'"
    },
    "nose": {
      "score": number,
      "label": "string",
      "dimorphism": "string",
      "details": "string — assess dorsum straightness, root height, tip definition, nostril width vs inner eye corners, projection, nasofrontal angle, overall size relative to face",
      "science": "string",
      "ideal": "string",
      "how_to_improve": "string — e.g. 'Nose is well-proportioned, no change required' OR 'Conservative Botox could slightly reduce nostril width — consult board-certified doctor'"
    },
    "lips_mouth": {
      "score": number,
      "label": "string",
      "dimorphism": "string",
      "details": "string — assess upper:lower ratio, fullness, cupid's bow definition, vermillion border, oral commissure angle, mouth width, any asymmetry in resting position",
      "science": "string",
      "ideal": "string",
      "how_to_improve": "string — e.g. 'No change required' OR 'Use lip balm with peptides for collagen support, gentle exfoliation for vermillion definition'"
    },
    "cheekbones": {
      "score": number,
      "label": "string",
      "dimorphism": "string",
      "details": "string — assess projection direction (outward = model look, forward = defined), prominence, ogee curve, fat pad distribution. Note: outward cheekbones are generally feminine but attractive on men (associated with classic model look)",
      "science": "string",
      "ideal": "string",
      "how_to_improve": "string — e.g. 'Reduce body fat to 12-14% to enhance facial contours and emphasize cheekbones'"
    },
    "jawline": {
      "score": number,
      "label": "string",
      "dimorphism": "string",
      "details": "string — assess shape (U/V/square), width, gonial angle, masseter definition, submental region. Note the jaw is the most sexually dimorphic feature",
      "science": "string — e.g. 'Lean jawline of standard width, U-shaped, marked by masseter definition. Strong muscularity without excessive width.'",
      "ideal": "string",
      "how_to_improve": "string — e.g. 'Reduce body fat for more chiseled look. Consider growing a beard to emphasize structure (if sparse, use 3% minoxidil daily — consult doctor). Chew mastic gum for masseter development.'"
    },
    "chin": {
      "score": number,
      "label": "string",
      "dimorphism": "string",
      "details": "string — assess projection, width, depth (flat vs deep), how it anchors the lower third",
      "science": "string",
      "ideal": "string",
      "how_to_improve": "string — e.g. 'No change required' OR 'Mewing and posture correction for forward growth'"
    },
    "skin": {
      "score": number,
      "label": "string",
      "details": "string — assess undertone (warm/cool/neutral), blemishing level (clear/mild/moderate/severe), tone evenness, wrinkle score, pore visibility, any redness/dermatitis, under-eye condition. Note: skin under eyes is 3x thinner than cheek skin",
      "science": "string — specific observations about undertone, any conditions visible",
      "ideal": "string",
      "how_to_improve": "string — FULL skincare protocol like QOVES: 'AM: Gentle cleanser, Vitamin C serum (improves radiance + evens tone), moisturizer with hyaluronic acid + niacinamide, SPF 50 daily (reduces aging 24%). PM: Gentle cleanser, toner to balance pH, tretinoin 0.025% (boosts collagen), moisturizer. Weekly: consider 3-5% DHA tanning drops mixed with moisturizer 2-3x/week for healthy color without sun damage. Monthly: consider hydrafacials for skin rejuvenation.'"
    },
    "hair": {
      "score": number,
      "label": "string",
      "details": "string — assess density, hairline shape (M-shaped, straight, receding), color, texture (straight/wavy/curly), frizz, length, styling, coverage quality. Reference any recession signs",
      "science": "string",
      "ideal": "string — what works best for their face shape",
      "how_to_improve": "string — e.g. 'Adopt hairstyle following natural part to frame face. Use sea salt spray daily for natural waves and flow. Style to reveal upper third for balance.' Include hairline advice if relevant"
    },
    "neck": {
      "score": number,
      "label": "string",
      "dimorphism": "string",
      "details": "string — assess width relative to jaw, length, Adam's apple visibility, chin-to-neck definition, sternocleidomastoid visibility",
      "science": "string",
      "ideal": "string",
      "how_to_improve": "string — e.g. 'Perform neck curls 3x15-20 reps, 3 times per week for front thickness. Neck extensions 3x20-25 reps, 3 times per week for side profile. Apply tretinoin 0.05% to neck for skin renewal.'"
    },
    "ears": {
      "score": number,
      "label": "string",
      "details": "string — assess size, set position, prominence, shape, any asymmetry between sides",
      "science": "string",
      "ideal": "string",
      "how_to_improve": "string — e.g. 'No change required' OR 'Hairstyle can help frame ears if prominent'"
    }
  },

  "smile_analysis": {
    "details": "string — if smile visible: assess dental show, cheek activation, dimples, smile span (average/wide/narrow), teeth alignment, teeth color (reddish-yellow/white/bright). If no smile visible, note 'Smile not visible in photo'",
    "how_to_improve": "string — e.g. 'Teeth appear slightly yellowish — consider professional whitening or white strips for cleaner appearance. Your full dental show with cheek elevation signals a genuine social smile ideal for first impressions.'"
  },

  "strengths": ["string — be very specific with science references, e.g. 'Strong bilateral symmetry (88/100) signals genetic health and developmental stability'", "string", "string"],

  "improvement_areas": [
    {
      "area": "string — body part or feature name",
      "current": "string — honest description of current state",
      "target": "string — what the ideal/improved version looks like",
      "suggestion": "string — DETAILED non-surgical protocol with specific products, dosages, frequencies, exercises. Example: 'Apply 3% minoxidil daily to beard area to stimulate growth. Use brow gel on eyebrows to darken and fill. Reduce body fat to 12-14% through caloric deficit. Perform neck curls 3x15-20 reps 3x/week.'",
      "priority": "high" or "medium" or "low",
      "timeframe": "string — e.g. '4-8 weeks for skincare visible results, 3-6 months for body composition changes, 6-12 months for beard growth'"
    }
  ],

  "harmony_score": number (1.0-10.0),
  "masculinity_score": number (1.0-10.0),
  "social_perception": "string — how others perceive this person: approachable, intimidating, trustworthy, friendly, serious, etc.",
  "what_a_10_looks_like": "string — be realistic about bone structure limitations. Describe exactly what soft-tissue improvements (body fat, skin, grooming, hair) could achieve vs what would require surgical intervention. End with encouraging note about their aesthetic potential.",

  "closing_letter": "string — A personalized letter like QOVES writes. Example: 'Dear [User], based on the image provided, you display a number of strong [masculine/feminine] facial features. There is potential for further improvement by focusing on [top 3 areas]. Our recommendations aim to subtly enhance [goal]. We recommend implementing the suggested protocol and reassessing in 3-6 months. Warm regards, Face Analyst AI'"
}

STRICT RULES:
- aesthetic_score is 0-100 (personal potential scale like QOVES, NOT an absolute beauty ranking)
- facial_averageness is 0-100 (0 = extremely unique, 50 = average, 100 = extremely common)
- facial_symmetry is 0-100 (higher = more symmetric)
- overall_score is 1.0-10.0. Be HONEST. Most people: 5-7. A 10 is virtually impossible.
- Category labels: <4 = "Needs Work", 4-6 = "Average", 6-7.5 = "Good", 7.5-8.5 = "Great", 8.5+ = "Exceptional"
- strengths: exactly 3, each with scientific reference
- improvement_areas: at least 5 items, ordered by impact. #1 for most people: body fat reduction. Include SPECIFIC products (Brimonidine, minoxidil 3%, tretinoin 0.025%, vitamin C serum, hyaluronic acid, SPF 50, DHA tanning drops, sea salt spray, brow gel, mastic gum) and exercise protocols (neck curls, neck extensions with sets/reps).
- Every "how_to_improve" MUST name specific products/exercises/routines — never vague advice.
- Be brutally honest like QOVES. Scientific objectivity over feelings. But end with encouragement.
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
