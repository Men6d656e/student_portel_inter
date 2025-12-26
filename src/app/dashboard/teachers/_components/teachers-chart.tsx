"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export function TeachersChart() {
    const { data: rankings, isLoading } = trpc.teacher.getRankings.useQuery();

    if (isLoading) {
        return (
            <Card className="col-span-4 h-[450px]">
                <CardHeader>
                    <CardTitle>Top Teachers Rankings</CardTitle>
                </CardHeader>
                <CardContent className="pl-2 flex h-[350px] items-center justify-center">
                    <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-4 transition-all hover:shadow-md animate-in fade-in duration-700">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <CardTitle>Teacher Performance</CardTitle>
                    <CardDescription>Top teachers ranked by uploaded results.</CardDescription>
                </div>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[350px] w-full">
                    {rankings && rankings.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={rankings}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: 'var(--radius)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Bar
                                    dataKey="uploads"
                                    fill="url(#barGradient)"
                                    radius={[6, 6, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground italic">
                            No upload data available yet.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
