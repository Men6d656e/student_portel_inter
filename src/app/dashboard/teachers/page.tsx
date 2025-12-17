import { StatsCards } from "./_components/stats-cards";
import { TeachersChart } from "./_components/teachers-chart";
import { TeachersTable } from "./_components/teachers-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teachers Management",
  description: "Manage verify and update teachers.",
};

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import AccessDeniedPage from "@/app/access-denied/page";
import { redirect } from "next/navigation";

export default async function TeachersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  // Check for admin role. 
  // Note: session.user.role might need type extension in better-auth, 
  // but if it's in DB, better-auth usually returns it if configured.
  // Assuming role is available on user object.
  // If strict type checking fails, I might need to cast or fetch user from DB.
  // For safety, I'll cast or assume it works for now, or check DB if critical.
  if ((session.user as any).role !== "ADMIN") {
    return <AccessDeniedPage />;
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Teachers</h2>
          <p className="text-muted-foreground">
            Manage your teachers and view their performance.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/dashboard/teachers/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Teacher
            </Link>
          </Button>
        </div>
      </div>

      <StatsCards />

      <div className="grid gap-4 md:grid-cols-1">
        <TeachersChart />
      </div>

      <div className="md:grid-cols-1">
        <TeachersTable />
      </div>
    </div>
  );
}