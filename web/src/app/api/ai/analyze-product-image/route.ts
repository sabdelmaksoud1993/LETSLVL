import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AnalyzeImageResponse {
  readonly title: string;
  readonly brand: string;
  readonly category: string;
  readonly description: string;
  readonly tags: string[];
  readonly suggestedPrice: number;
}

// ---------------------------------------------------------------------------
// Mock response for dev mode
// ---------------------------------------------------------------------------

function generateMockSuggestions(): AnalyzeImageResponse {
  const mockProducts = [
    {
      title: "Limited Edition Streetwear Hoodie",
      brand: "Fear of God",
      category: "Hoodies & Sweatshirts",
      description:
        "Premium oversized hoodie with dropped shoulders and heavyweight cotton construction. Features minimal branding and a relaxed silhouette that defines modern streetwear.",
      tags: ["streetwear", "hoodie", "oversized", "premium", "limited edition"],
      suggestedPrice: 450,
    },
    {
      title: "Vintage Air Jordan 1 High OG",
      brand: "Nike",
      category: "Sneakers",
      description:
        "Iconic high-top basketball sneakers in pristine condition. Features the classic colorblocking design with premium leather upper, Air-Sole cushioning, and original box included.",
      tags: ["sneakers", "jordan", "nike", "vintage", "basketball", "retro"],
      suggestedPrice: 850,
    },
    {
      title: "Luxury Crossbody Bag",
      brand: "Off-White",
      category: "Bags & Accessories",
      description:
        "Contemporary crossbody bag featuring signature diagonal stripes and industrial-inspired hardware. Crafted from premium materials with adjustable strap and multiple compartments.",
      tags: ["bag", "crossbody", "luxury", "designer", "accessories"],
      suggestedPrice: 1200,
    },
  ] as const;

  const index = Math.floor(Math.random() * mockProducts.length);
  const selected = mockProducts[index];
  return {
    title: selected.title,
    brand: selected.brand,
    category: selected.category,
    description: selected.description,
    tags: [...selected.tags],
    suggestedPrice: selected.suggestedPrice,
  };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let imageBase64: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("image") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "Image file is required" },
          { status: 400 }
        );
      }

      const buffer = await file.arrayBuffer();
      imageBase64 = Buffer.from(buffer).toString("base64");
    } else {
      const body = await request.json();
      imageBase64 = body.image as string | null;

      if (!imageBase64) {
        return NextResponse.json(
          { error: "Image data is required" },
          { status: 400 }
        );
      }
    }

    // Check for AI API keys
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // If no API keys, return mock suggestions (dev mode)
    if (!anthropicKey && !openaiKey) {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      const mock = generateMockSuggestions();
      return NextResponse.json(mock);
    }

    const prompt = `Analyze this product image for an e-commerce fashion/collectibles platform targeting the MENA region.

Provide your analysis as a JSON object with these exact keys:
- "title": A compelling product title (max 80 chars)
- "brand": The brand name if visible, or best guess
- "category": Product category (e.g. Sneakers, Hoodies, T-Shirts, Bags, Accessories, Collectibles)
- "description": A 2-3 sentence product description
- "tags": An array of 5-8 relevant tags
- "suggestedPrice": Estimated price in AED (number only)

Return ONLY the JSON object. No markdown, no code blocks.`;

    // Production: use Claude Vision if available
    if (anthropicKey) {
      const mediaType = imageBase64.startsWith("/9j/")
        ? "image/jpeg"
        : imageBase64.startsWith("iVBOR")
          ? "image/png"
          : "image/jpeg";

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
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mediaType,
                    data: imageBase64,
                  },
                },
                { type: "text", text: prompt },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      const text =
        data.content?.[0]?.type === "text" ? data.content[0].text : "";
      const parsed = JSON.parse(text) as AnalyzeImageResponse;

      return NextResponse.json({
        title: parsed.title,
        brand: parsed.brand,
        category: parsed.category,
        description: parsed.description,
        tags: parsed.tags,
        suggestedPrice: parsed.suggestedPrice,
      });
    }

    // Use OpenAI Vision
    if (openaiKey) {
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
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:image/jpeg;base64,${imageBase64}`,
                    },
                  },
                  { type: "text", text: prompt },
                ],
              },
            ],
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
      const parsed = JSON.parse(text) as AnalyzeImageResponse;

      return NextResponse.json({
        title: parsed.title,
        brand: parsed.brand,
        category: parsed.category,
        description: parsed.description,
        tags: parsed.tags,
        suggestedPrice: parsed.suggestedPrice,
      });
    }

    // Fallback
    const mock = generateMockSuggestions();
    return NextResponse.json(mock);
  } catch (err) {
    console.error("AI image analysis failed:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to analyze image",
      },
      { status: 500 }
    );
  }
}
