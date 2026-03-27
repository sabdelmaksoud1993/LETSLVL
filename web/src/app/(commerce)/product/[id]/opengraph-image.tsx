import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase-server";

export const runtime = "edge";
export const alt = "Product on LET'S LVL";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("title, price, currency, brand, images")
    .eq("id", id)
    .single();

  const title = product?.title ?? "Product";
  const brand = product?.brand ?? "";
  const price = product?.price ?? 0;
  const currency = product?.currency ?? "AED";
  const imageUrl = product?.images?.[0] ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#0A0A0A",
          position: "relative",
        }}
      >
        {/* Yellow accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            backgroundColor: "#F5C518",
          }}
        />

        {/* Product image area */}
        {imageUrl && (
          <div
            style={{
              width: 420,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 40,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              width={340}
              height={425}
              style={{ objectFit: "cover", borderRadius: 12 }}
            />
          </div>
        )}

        {/* Text content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 60px 60px 20px",
          }}
        >
          {/* Brand */}
          {brand && (
            <div
              style={{
                fontSize: 18,
                color: "#F5C518",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              {brand}
            </div>
          )}

          {/* Title */}
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              color: "#FFFFFF",
              textTransform: "uppercase",
              lineHeight: 1.1,
              marginBottom: 24,
              maxWidth: 600,
            }}
          >
            {title}
          </div>

          {/* Price */}
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#F5C518",
            }}
          >
            {currency} {price.toLocaleString()}
          </div>

          {/* Branding */}
          <div
            style={{
              position: "absolute",
              bottom: 40,
              right: 60,
              fontSize: 20,
              fontWeight: 700,
              color: "#F5C518",
              letterSpacing: "0.1em",
            }}
          >
            LET&apos;S LVL
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
