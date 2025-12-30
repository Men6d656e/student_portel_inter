"use client";

import {
  GraduationCap,
  LogOut,
  Users,
  UserSquare2,
  User,
  Plus,
  ClipboardClock,
  Search,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ThemeToogle } from "./theme-toogle-button";

// Menu items.
const adminItems = [
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Upload",
    url: "/dashboard/upload-result",
    icon: Plus,
  },
  {
    title: "Search Result",
    url: "/dashboard/search-result",
    icon: Search,
  },
  {
    title: "Teachers",
    url: "/dashboard/teachers",
    icon: UserSquare2,
  },
  {
    title: "Students",
    url: "/dashboard/students",
    icon: Users,
  },
  {
    title: "Results",
    url: "/dashboard/results",
    icon: GraduationCap,
  },
  {
    title: "Insights",
    url: "/dashboard/insights",
    icon: ClipboardClock,
  },
];

const teacherItems = [
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Upload",
    url: "/dashboard/upload-result",
    icon: Plus,
  },
  {
    title: "Search Result",
    url: "/dashboard/search-result",
    icon: Search,
  },
  {
    title: "Results",
    url: "/dashboard/results",
    icon: GraduationCap,
  },
  {
    title: "Insights",
    url: "/dashboard/insights",
    icon: ClipboardClock,
  },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  // Prevent hydration mismatch by returning skeleton or null until loaded, 
  // but for sidebar we might want to just default to one or show nothing.
  // Better: Use `userRole` derived safely.
  const userRole = (session?.user as any)?.role;

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Logged out successfully");
          router.push("/sign-in");
        },
      },
    });
  };

  if (isPending) {
    return (
      <Sidebar>
        <SidebarHeader />
        <SidebarContent>
          <div className="flex items-center justify-center h-full">
            {/* Optional: Add Loader here if desired, otherwise just empty sidebar structure */}
          </div>
        </SidebarContent>
      </Sidebar>
    )
  }

  return (
    <Sidebar className="">
      <SidebarHeader>
        <div className="flex justify-center items-center py-6 text-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <p className="text-md font-bold leading-tight text-left">
            Result Management <br />
            System
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-5">
          <SidebarGroupLabel className="text-lg">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userRole === "ADMIN" &&
                adminItems.map((item) => (
                  <SidebarMenuItem key={item.title} className="">
                    <SidebarMenuButton asChild isActive={pathname === item.url} className="h-11 px-4 hover:bg-primary/10 transition-colors">
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              {userRole === "TEACHER" &&
                teacherItems.map((item) => (
                  <SidebarMenuItem key={item.title} className="">
                    <SidebarMenuButton asChild isActive={pathname === item.url} className="h-11 px-4 hover:bg-primary/10 transition-colors">
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="px-5 mb-6">
            <SidebarMenuButton
              onClick={handleLogout}
              className="h-11 border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-all font-semibold"
            >
              <LogOut className="w-5 h-5" />
              <span className="ml-2">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
