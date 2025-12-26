"use client";

import { useMemo, useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

import { Loader2, TrendingUp, Users, Target, Award, Info } from "lucide-react";
import { useTheme } from "next-themes";


import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function PerformanceHub() {
  const [selectedResultId, setSelectedResultId] = useState<string>("");
  const { theme } = useTheme();


  const { data: uploads } = trpc.uploadedResults.getMyUploads.useQuery({});

  const { data: resultDetails, isFetching } = trpc.result.getById.useQuery(
    { id: selectedResultId },
    {
      enabled: !!selectedResultId,
      refetchOnWindowFocus: false,
    }
  );


  /* ---------------- ANALYTICS ---------------- */

  const stats = useMemo(() => {
    if (!resultDetails?.studentResults?.length) {
      return {
        total: 0,
        pass: 0,
        fail: 0,
        avg: 0,
        chartData: [],
        topStudents: [],
      };
    }

    const totalMarks = resultDetails.totalMarks;
    const passThreshold = totalMarks * 0.33;
    const results = resultDetails.studentResults;

    const pass = results.filter((r) => r.obtainedMarks >= passThreshold).length;
    const fail = results.length - pass;
    const avg = results.reduce((a, b) => a + b.obtainedMarks, 0) / results.length;

    return {
      total: results.length,
      pass,
      fail,
      avg: Number(avg.toFixed(1)),
      chartData: [
        { name: "Pass", value: pass, color: "hsl(var(--primary))" },
        { name: "Fail", value: fail, color: "hsl(var(--destructive))" },
      ],

      topStudents: [...results]
        .sort((a, b) => b.obtainedMarks - a.obtainedMarks)
        .slice(0, 5),
    };
  }, [resultDetails]);

  /* ---------------- UI ---------------- */

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Insights Hub</h1>
          <p className="text-muted-foreground">Deep dive into class performance and achievement metrics.</p>
        </div>

        <Select value={selectedResultId} onValueChange={setSelectedResultId}>
          <SelectTrigger className="w-full md:w-[350px] shadow-sm border-primary/10 bg-card/50 backdrop-blur-sm">
            <SelectValue placeholder="Select a result to analyze" />
          </SelectTrigger>
          <SelectContent>
            {uploads?.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                <span className="font-medium">{u.subject}</span>
                <span className="mx-2 text-muted-foreground">•</span>
                <span className="text-xs uppercase text-muted-foreground">{u.resultType}</span>
                <span className="mx-2 text-muted-foreground">•</span>
                <span className="text-xs">{u.class}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedResultId ? (
        <Card className="h-[400px] flex flex-col items-center justify-center border-dashed bg-primary/5 text-muted-foreground animate-in zoom-in-95 duration-500">
          <div className="bg-background p-4 rounded-full shadow-sm mb-4">
            <Target className="h-10 w-10 text-primary/40" />
          </div>
          <p className="text-lg font-medium">No Result Selected</p>
          <p className="text-sm">Choose a result from the dropdown to see detailed analytics</p>
        </Card>
      ) : isFetching ? (
        <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Loader2 className="h-6 w-6 absolute top-3 left-3 animate-pulse text-primary" />
          </div>
          <p className="text-sm font-medium animate-pulse">Analyzing performance data...</p>
        </div>

      ) : resultDetails ? (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Average Score"
              icon={<TrendingUp className="h-4 w-4 text-blue-500" />}
              description={`Out of ${resultDetails.totalMarks} total marks`}
            >
              {stats.avg}
            </StatCard>

            <StatCard
              title="Pass Percentage"
              icon={<Award className="h-4 w-4 text-orange-500" />}
              description="Meeting 33% criteria"
            >
              {stats.total ? Math.round((stats.pass / stats.total) * 100) : 0}%
            </StatCard>

            <StatCard
              title="Total Students"
              icon={<Users className="h-4 w-4 text-green-600" />}
              description="Students appeared in exam"
            >
              {stats.total}
            </StatCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* PIE CHART */}
            <Card className="lg:col-span-3 border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pass vs Fail Distribution</CardTitle>
                    <CardDescription>Visual breakdown of student success rates</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                    <Info className="h-3 w-3 mr-1" /> Standards
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="h-[400px] pt-0">
                {stats.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.chartData}
                        dataKey="value"
                        className="stroke-background stroke-2"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        startAngle={90}
                        endAngle={-270}
                        animationDuration={1500}
                        cornerRadius={4}
                      >
                        {stats.chartData.map((d, i) => (
                          <Cell key={`cell-${i}`} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                          backgroundColor: 'hsl(var(--card))',
                          padding: '12px'
                        }}
                        itemStyle={{ fontWeight: '500' }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={40}
                        iconType="circle"
                        formatter={(value) => <span className="text-sm font-medium px-2">{value}</span>}
                      />
                    </PieChart>

                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* TOP STUDENTS */}
            <Card className="lg:col-span-2 border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Top Performers
                </CardTitle>
                <CardDescription>The highest scoring students in this result</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                {stats.topStudents.length > 0 ? (
                  <div className="space-y-4">
                    {stats.topStudents.map((sr, index) => (
                      <div
                        key={sr.id}
                        className="flex justify-between items-center p-3 rounded-xl bg-primary/5 border border-primary/10 transition-transform hover:scale-[1.02]"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-500/20 text-yellow-600' :
                              index === 1 ? 'bg-slate-300/40 text-slate-600' :
                                index === 2 ? 'bg-orange-500/20 text-orange-600' :
                                  'bg-muted text-muted-foreground'
                            }`}>
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{sr.student.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{sr.student.rollNo}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-primary">{sr.obtainedMarks}</div>
                          <div className="text-[9px] text-muted-foreground">MARKS</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                    <Users className="h-8 w-8 opacity-20 mb-2" />
                    <p>No students found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ---------------- HELPERS ---------------- */

function StatCard({
  title,
  children,
  icon,
  description
}: {
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  description?: string;
}) {
  return (
    <Card className="bg-primary/5 border-primary/20 transition-all hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className="bg-background p-2 rounded-lg shadow-sm">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{children}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}