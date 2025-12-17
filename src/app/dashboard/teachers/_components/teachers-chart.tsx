"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader } from "lucide-react";
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
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Teacher Performance</CardTitle>
                <CardDescription>Top teachers ranked by uploaded results.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[350px] w-full">
                    {rankings && rankings.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={rankings}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                    itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                                />
                                <Bar
                                    dataKey="uploads"
                                    fill="hsl(var(--primary))"
                                    radius={[4, 4, 0, 0]}
                                    className="fill-primary"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            No data available
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
