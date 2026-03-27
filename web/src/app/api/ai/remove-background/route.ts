import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// POST /api/ai/remove-background
//
// In dev/mock mode (no REMOVE_BG_API_KEY), returns the original image URL.
// In production mode, calls the remove.bg API to process the image.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid imageUrl" },
        { status: 400 }
      );
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;

    // ---- Mock mode (dev) --------------------------------------------------
    if (!apiKey) {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      return NextResponse.json({
        processedUrl: imageUrl,
        mock: true,
        message: "Mock mode: REMOVE_BG_API_KEY not set. Returning original image.",
      });
    }

    // ---- Production mode --------------------------------------------------
    const removeBgResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        image_url: imageUrl,
        size: "auto",
        type: "product",
        format: "png",
      }),
    });

    if (!removeBgResponse.ok) {
      const errorText = await removeBgResponse.text().catch(() => "Unknown error");
      console.error("remove.bg API error:", errorText);
      return NextResponse.json(
        { error: "Background removal service failed. Please try again." },
        { status: 502 }
      );
    }

    const result = await removeBgResponse.json();

    // remove.bg returns the image as base64 in result_b64 when Accept is application/json
    if (result.data?.result_b64) {
      const dataUrl = `data:image/png;base64,${result.data.result_b64}`;
      return NextResponse.json({ processedUrl: dataUrl });
    }

    // Fallback: if the response contains a URL directly
    if (result.data?.url) {
      return NextResponse.json({ processedUrl: result.data.url });
    }

    return NextResponse.json(
      { error: "Unexpected response from background removal service" },
      { status: 502 }
    );
  } catch (err) {
    console.error("Background removal error:", err);
    return NextResponse.json(
      { error: "Internal server error during background removal" },
      { status: 500 }
    );
  }
}
