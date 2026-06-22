import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { GOOGLE_SHEETS_URL } from "@/features/auth/profile-schema";

async function notifyGoogleSheets(body: Record<string, unknown>) {
  const payload = {
    owner_first_name: body.owner_first_name ?? "",
    owner_last_name: body.owner_last_name ?? "",
    owner_email: body.owner_email ?? "",
    owner_phone: body.owner_phone ?? "",
    owner_city: body.owner_city ?? "",
    pet_name: body.pet_name ?? "",
    pet_breed: body.pet_breed ?? "",
    pet_birthday: body.pet_birthday ?? "",
    pet_age_years: body.pet_age_years ?? "",
    pet_weight_lbs: body.pet_weight_lbs ?? "",
    pet_sex: body.pet_sex ?? "",
    health_conditions: body.health_conditions ?? "",
    signup_source: body.signup_source ?? "",
  };

  try {
    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    await response.text();
  } catch (err) {
    console.error("[Sheets] ERROR:", err);
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email =
    typeof body.owner_email === "string" ? body.owner_email.toLowerCase().trim() : "";

  if (!email) {
    return NextResponse.json({ error: "owner_email is required" }, { status: 400 });
  }

  try {
    await connectDB();

    // Update the logged-in user's embedded profile sub-document
    await UserModel.updateOne(
      { _id: session.user.id },
      {
        $set: {
          profile: {
            owner_first_name: body.owner_first_name ?? "",
            owner_last_name: body.owner_last_name ?? "",
            owner_email: email,
            owner_phone: body.owner_phone ?? "",
            owner_city: body.owner_city ?? "",
            pet_name: body.pet_name ?? "",
            pet_breed: body.pet_breed ?? "",
            pet_birthday: body.pet_birthday ?? "",
            pet_age_years: body.pet_age_years ?? undefined,
            pet_weight_lbs: body.pet_weight_lbs ?? undefined,
            pet_sex: body.pet_sex ?? "",
            health_conditions: body.health_conditions ?? "",
            signup_source: body.signup_source ?? "",
          },
        },
      },
    );

    // Mirror to Google Sheets in parallel — never blocks the response
    notifyGoogleSheets(body);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/profile/save]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ profile: null }, { status: 200 });
  }

  try {
    await connectDB();
    const user = await UserModel.findById(session.user.id).lean() as any;
    return NextResponse.json({ profile: user?.profile ?? null });
  } catch (err) {
    console.error("[api/profile/save GET]", err);
    return NextResponse.json({ profile: null }, { status: 200 });
  }
}
