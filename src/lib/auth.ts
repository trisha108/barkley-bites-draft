import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import type { UserDocument } from "@/models/User";

export async function getCurrentUser(): Promise<UserDocument | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectDB();
  const user = await UserModel.findById(session.user.id);
  return user;
}