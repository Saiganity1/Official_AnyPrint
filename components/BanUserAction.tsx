"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BanUserAction({ userId, isBanned, bannedUntil }: { userId: string; isBanned: boolean; bannedUntil: Date | null }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const action = e.target.value;
    if (!action) return;

    let confirmationMessage = "";
    if (action === "BAN_PERMANENT") confirmationMessage = "Are you sure you want to permanently ban this user?";
    if (action === "BAN_3_DAYS") confirmationMessage = "Are you sure you want to suspend this user for 3 days?";
    if (action === "BAN_7_DAYS") confirmationMessage = "Are you sure you want to suspend this user for 7 days?";
    if (action === "UNBAN") confirmationMessage = "Are you sure you want to unban this user?";

    if (!confirm(confirmationMessage)) {
      e.target.value = "";
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to update ban status");
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  };

  let statusText = "Active";
  let statusColor = "#22c55e"; // Green

  if (isBanned) {
    if (bannedUntil) {
      if (new Date(bannedUntil) > new Date()) {
        statusText = `Suspended until ${new Date(bannedUntil).toLocaleDateString()}`;
        statusColor = "#eab308"; // Yellow
      } else {
        // Technically ban expired but hasn't been cleared from DB yet
        statusText = "Active";
      }
    } else {
      statusText = "Permanently Banned";
      statusColor = "#ef4444"; // Red
    }
  }

  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <span style={{ fontSize: "0.875rem", color: statusColor, fontWeight: "500" }}>{statusText}</span>
      <select 
        onChange={handleAction} 
        disabled={isLoading}
        style={{
          padding: "0.5rem",
          background: "var(--background)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          color: "var(--foreground)",
          fontSize: "0.875rem"
        }}
        suppressHydrationWarning
      >
        <option value="">Actions...</option>
        {(!isBanned || (isBanned && bannedUntil && new Date(bannedUntil) <= new Date())) && (
          <>
            <option value="BAN_3_DAYS">Suspend for 3 Days</option>
            <option value="BAN_7_DAYS">Suspend for 7 Days</option>
            <option value="BAN_PERMANENT">Ban Permanently</option>
          </>
        )}
        {(isBanned && (!bannedUntil || new Date(bannedUntil) > new Date())) && (
          <option value="UNBAN">Unban User</option>
        )}
      </select>
    </div>
  );
}
