"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToogle } from "@/components/theme-toogle-button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth-client";

export function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  // Extract the last part of the path for the title, capitalize it
  const title = pathname.split("/").pop()?.replace(/-/g, " ") || "Dashboard";

  // Dummy user data

  const { data: session, isPending } = useSession();
  const user = session?.user;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const { data: teachersNeedAprovel } =
    trpc.teacher.getTeachersNeedAprovel.useQuery(undefined, {
      refetchInterval: 10000, // Refetch every 10 seconds
      refetchIntervalInBackground: true,
    });

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-4 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
      </div>
      <div className="flex items-center gap-4">
        <div
          className="relative cursor-pointer p-2"
          onClick={() => router.push("/dashboard/approvel")}
        >
          {teachersNeedAprovel && teachersNeedAprovel.length > 0 ? (
            <Bell className="w-4 h-4 text-primary animate-bounce" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Avatar>
            {user && user.image && (
              <AvatarImage src={user?.image} alt={user?.name.charAt(0)} />
            )}
            <AvatarFallback className="text-xs uppercase">
              {user?.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
