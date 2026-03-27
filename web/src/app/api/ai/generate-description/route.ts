import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GenerateDescriptionRequest {
  readonly title: string;
  readonly brand: string;
  readonly category: string;
  readonly keywords: string;
}

interface GenerateDescriptionResponse {
  readonly english: string;
  readonly arabic: string;
}

// ---------------------------------------------------------------------------
// Mock descriptions for dev mode
// ---------------------------------------------------------------------------

function generateMockDescription(
  title: string,
  brand: string,
  category: string,
  keywords: string
): GenerateDescriptionResponse {
  const brandText = brand ? ` by ${brand}` : "";
  const keywordList = keywords
    ? keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : [];
  const keywordText =
    keywordList.length > 0 ? ` Features: ${keywordList.join(", ")}.` : "";

  const english = `Discover the ${title}${brandText} — a standout piece in the ${category || "fashion"} category. Crafted with premium materials and attention to detail, this item delivers both style and quality.${keywordText} Perfect for collectors and fashion enthusiasts across the MENA region. Authenticity guaranteed. Ships from Dubai with express delivery available to UAE, Saudi Arabia, and beyond.`;

  const arabic = `اكتشف ${title}${brandText ? ` من ${brand}` : ""} — قطعة مميزة في فئة ${category || "الأزياء"}. مصنوعة بمواد فاخرة واهتمام بالتفاصيل، توفر هذه القطعة الأناقة والجودة معاً.${keywordText ? ` المميزات: ${keywordList.join("، ")}.` : ""} مثالية لهواة الجمع وعشاق الموضة في منطقة الشرق الأوسط. الأصالة مضمونة. الشحن من دبي مع توصيل سريع متاح إلى الإمارات والسعودية وأكثر.`;

  return { english, arabic };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateDescriptionRequest;

    const { title, brand, category, keywords } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Check for AI API keys
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // If no API keys, return mock descriptions (dev mode)
    if (!anthropicKey && !openaiKey) {
      const mock = generateMockDescription(title, brand, category, keywords);
      return NextResponse.json(mock);
    }

    // Production: use Claude API if available, otherwise OpenAI
    if (anthropicKey) {
      const prompt = `Generate an SEO-optimized product description for an e-commerce listing on a fashion/collectibles platform targeting the MENA region.

Product Title: ${title}
Brand: ${brand || "N/A"}
Category: ${category || "General"}
Keywords: ${keywords || "N/A"}

Generate two descriptions:
1. English description (150-200 words): Professional, engaging, SEO-friendly. Mention authenticity, quality, and regional shipping.
2. Arabic description (150-200 words): Same content in fluent Arabic, culturally appropriate for MENA buyers.

Return ONLY a JSON object with "english" and "arabic" keys. No markdown, no code blocks.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      const text =
        data.content?.[0]?.type === "text" ? data.content[0].text : "";
      const parsed = JSON.parse(text) as GenerateDescriptionResponse;

      return NextResponse.json({
        english: parsed.english,
        arabic: parsed.arabic,
      });
    }

    if (openaiKey) {
      const prompt = `Generate an SEO-optimized product description for an e-commerce listing on a fashion/collectibles platform targeting the MENA region.

Product Title: ${title}
Brand: ${brand || "N/A"}
Category: ${category || "General"}
Keywords: ${keywords || "N/A"}

Generate two descriptions:
1. English description (150-200 words): Professional, engaging, SEO-friendly. Mention authenticity, quality, and regional shipping.
2. Arabic description (150-200 words): Same content in fluent Arabic, culturally appropriate for MENA buyers.

Return ONLY a JSON object with "english" and "arabic" keys. No markdown, no code blocks.`;

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1024,
            response_format: { type: "json_object" },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content ?? "";
      const parsed = JSON.parse(text) as GenerateDescriptionResponse;

      return NextResponse.json({
        english: parsed.english,
        arabic: parsed.arabic,
      });
    }

    // Fallback
    const mock = generateMockDescription(title, brand, category, keywords);
    return NextResponse.json(mock);
  } catch (err) {
    console.error("AI description generation failed:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to generate description",
      },
      { status: 500 }
    );
  }
}
