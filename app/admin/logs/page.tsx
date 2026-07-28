import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminLogsClient } from "@/components/AdminLogsClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AdminLogsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (role !== "ADMIN" && role !== "OWNER") {
    redirect("/");
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true, role: true }
      }
    }
  });

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>System Logs</h1>
      <p style={{ color: 'var(--foreground-muted)', marginBottom: '2rem' }}>
        Track administrative actions and system events.
      </p>

      <AdminLogsClient initialLogs={logs} />
    </div>
  );
}
