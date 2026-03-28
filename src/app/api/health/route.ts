import { NextResponse } from "next/server";

export async function GET() {
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
  const hasReplicateToken = !!process.env.REPLICATE_API_TOKEN;
  const demoMode = process.env.DEMO_MODE === "true";

  return NextResponse.json({
    ok: true,
    demoMode,
    anthropicKey: hasAnthropicKey ? "✓ ingesteld" : "✗ ONTBREEKT",
    replicateToken: hasReplicateToken ? "✓ ingesteld" : "✗ ontbreekt (alleen voor enhance)",
  });
}
