"use client";

import { useSession } from "next-auth/react";
import ProfilePage from "@/components/ProfilePage";

export default function Page() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="min-h-screen" />;
  }

  if (!session?.user?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  return <ProfilePage email={session.user.email} />;
}
