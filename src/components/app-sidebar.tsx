"use client"

import {
    BarChart,
    GraduationCap,
    LogOut,
    Users,
    UserSquare2 // Using this for Teachers
} from "lucide-react"

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
} from "@/components/ui/sidebar"
import { signOut } from "@/lib/auth-client"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"

// Menu items.
const items = [
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
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: BarChart,
    },
]

export function AppSidebar() {
    const router = useRouter()
    const pathname = usePathname()

    const handleLogout = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    toast.success("Logged out successfully")
                    router.push("/sign-in")
                },
            },
        })
    }

    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex justify-center items-center py-4 text-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                        <GraduationCap className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-md font-bold leading-tight text-left">Result Management <br />System</p>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-lg">Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                                        <a href={item.url} className="">
                                            <item.icon />
                                            <span className="p-2">{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={handleLogout} className="text-accent-foreground hover:text-accent-foreground hover:bg-accent">
                            <LogOut />
                            <span className="p-2">Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
