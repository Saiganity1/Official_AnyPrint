import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      address: true,
      city: true,
      province: true,
      zipCode: true,
    }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container animate-fade-in" style={{ padding: "4rem 1.5rem" }}>
      <h1 style={{ fontSize: "2.5rem", textAlign: "center", marginBottom: "3rem" }}>My Profile</h1>
      
      <div className="glass-card" style={{ padding: "3rem 2rem", maxWidth: "600px", margin: "0 auto" }}>
        <ProfileForm initialData={user} />
      </div>
    </div>
  );
}
