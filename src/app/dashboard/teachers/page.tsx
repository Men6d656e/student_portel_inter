"use client";

import { StatsCards } from "./_components/stats-cards";
import { TeachersChart } from "./_components/teachers-chart";
import { TeachersTable } from "./_components/teachers-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import AccessDeniedPage from "@/app/access-denied/page";
import { PageLoader } from "@/components/page-loader";

export default function TeachersPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <PageLoader />;
  }

  if (!session?.user) {
    redirect("/sign-in");
  }

  if ((session.user as any).role !== "ADMIN") {
    return <AccessDeniedPage />;
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Teachers</h2>
          <p className="text-muted-foreground">
            Manage your teachers and monitor their upload activity.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild className="shadow-lg shadow-primary/20 transition-all hover:scale-105">
            <Link href="/dashboard/teachers/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Teacher
            </Link>
          </Button>
        </div>
      </div>

      <StatsCards />

      <div className="grid gap-8 md:grid-cols-1">
        <TeachersChart />
      </div>


      <div className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight ml-1">Verified Faculty</h3>
        <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            <TeachersTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
