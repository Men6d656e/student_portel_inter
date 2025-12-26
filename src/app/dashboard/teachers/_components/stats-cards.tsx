"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader, Users, UserCheck, UserX, FileText } from "lucide-react";

export function StatsCards() {
    const { data: stats, isLoading } = trpc.teacher.getStats.useQuery();

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="flex flex-col justify-between h-[120px]">
                        <CardContent className="flex h-full items-center justify-center">
                            <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-primary/5 border-primary/20 transition-all hover:bg-primary/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                    <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalTeachers ?? 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Registered in system</p>
                </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Verified Teachers</CardTitle>
                    <div className="h-4 w-4 rounded-full bg-green-500/10 flex items-center justify-center">
                        <UserCheck className="h-3 w-3 text-green-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.verifiedTeachers ?? 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Authorized access</p>
                </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unverified Teachers</CardTitle>
                    <div className="h-4 w-4 rounded-full bg-destructive/10 flex items-center justify-center">
                        <UserX className="h-3 w-3 text-destructive" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.unverifiedTeachers ?? 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Pending approval</p>
                </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Results Uploaded</CardTitle>
                    <FileText className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalResults ?? 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Documents processed</p>
                </CardContent>
            </Card>
        </div>
    );
}
