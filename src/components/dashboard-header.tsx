"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToogle } from "@/components/theme-toogle-button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePathname } from "next/navigation"

export function DashboardHeader() {
    const pathname = usePathname()
    // Extract the last part of the path for the title, capitalize it
    const title = pathname.split("/").pop()?.replace(/-/g, " ") || "Dashboard"

    // Dummy user data
    const user = {
        name: "Admin User",
        email: "admin@example.com",
        avatar: "" // Empty for fallback
    }

    const getInitials = (name: string) => {
        return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    }

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
            <div className="flex items-center gap-4">
                <ThemeToogle />
                <div className="flex items-center gap-2">
                    <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-xs ">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    )
}
