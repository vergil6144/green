// app/api/classify/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { image } = await req.json();
  const trashData = {
  type: "Plastic Bottle",
  recyclable: true,
  biodegradable: false,
  tip: "Rinse and place in plastics recycling bin."
};

  // TODO: Send `image` to AI model here.
  // For now, mock response:
return(
  <div>{trashData.type}</div>
)
}
