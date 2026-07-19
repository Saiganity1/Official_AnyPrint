import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserRoleDropdown } from "@/components/UserRoleDropdown";
import { BanUserAction } from "@/components/BanUserAction";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (role !== "OWNER") {
    redirect("/admin"); // Only owner can see users
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Users</h1>
      </div>

      <div className="glass-card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--foreground-muted)' }}>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Name</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Email / Phone</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Joined Date</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Role</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Account Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', fontWeight: '500' }}>{user.name || "N/A"}</td>
                <td style={{ padding: '1rem', color: 'var(--foreground-muted)' }}>
                  <div>{user.email || "N/A"}</div>
                  <div style={{ fontSize: '0.875rem' }}>{user.phone || "N/A"}</div>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem' }}>
                  <UserRoleDropdown userId={user.id} initialRole={user.role} />
                </td>
                <td style={{ padding: '1rem' }}>
                  {user.role !== "OWNER" ? (
                    <BanUserAction userId={user.id} isBanned={user.isBanned} bannedUntil={user.bannedUntil} />
                  ) : (
                    <span style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '600' }}>System Owner</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
