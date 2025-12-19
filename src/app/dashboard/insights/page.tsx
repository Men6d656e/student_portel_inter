"use client";

import { useMemo, useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Loader2 } from "lucide-react";

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
  const [renderKey, setRenderKey] = useState<number>(0);

  const { data: uploads } = trpc.uploadedResults.getMyUploads.useQuery({});

  const { data: resultDetails, isFetching, refetch } = trpc.result.getById.useQuery(
    { id: selectedResultId },
    {
      enabled: !!selectedResultId,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 0,
      gcTime: 0,
    }
  );

  // Force component remount when selection changes or data arrives
  useEffect(() => {
    if (selectedResultId) {
      setRenderKey(prev => prev + 1);
      refetch();
    }
  }, [selectedResultId, refetch]);

  // Also update key when new data arrives
  useEffect(() => {
    if (resultDetails && !isFetching) {
      setRenderKey(prev => prev + 1);
    }
  }, [resultDetails, isFetching]);

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
        { name: "Pass", value: pass, color: "var(--chart-1)" },
        { name: "Fail", value: fail, color: "var(--destructive)" },
      ],
      topStudents: [...results]
        .sort((a, b) => b.obtainedMarks - a.obtainedMarks)
        .slice(0, 5),
    };
  }, [resultDetails]);

  /* ---------------- UI ---------------- */

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Insights</h1>
          <p className="text-muted-foreground">Class performance overview</p>
        </div>

        <Select value={selectedResultId} onValueChange={setSelectedResultId}>
          <SelectTrigger className="w-[320px]">
            <SelectValue placeholder="Select result" />
          </SelectTrigger>
          <SelectContent>
            {uploads?.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.subject} • {u.resultType} • {u.class}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedResultId ? (
        <Card className="h-[360px] flex items-center justify-center border-dashed text-muted-foreground">
          Select a result to view analytics
        </Card>
      ) : isFetching ? (
        <div key={`loading-${renderKey}`} className="h-[400px] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Fetching fresh data...</p>
        </div>
      ) : resultDetails ? (
        <div 
          key={`content-${renderKey}`}
          className="space-y-6 animate-in fade-in duration-500"
        >
          {/* Debug info - remove after fixing */}
          <div className="text-xs text-muted-foreground mb-2">
            Showing: {resultDetails.subject} • ID: {resultDetails.id.slice(-6)}
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Average Score">
              {stats.avg} / {resultDetails.totalMarks}
            </StatCard>

            <StatCard title="Pass Percentage">
              {stats.total ? Math.round((stats.pass / stats.total) * 100) : 0}%
            </StatCard>

            <StatCard title="Total Students">{stats.total}</StatCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PIE CHART */}
            <Card>
              <CardHeader>
                <CardTitle>Pass vs Fail</CardTitle>
                <CardDescription>Based on 33% passing criteria</CardDescription>
              </CardHeader>
              <CardContent className="h-[280px]">
                {stats.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart key={renderKey}>
                      <Pie
                        data={stats.chartData}
                        dataKey="value"
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={3}
                        stroke="transparent"
                        startAngle={90}
                        endAngle={-270}
                        animationDuration={1000}
                      >
                        {stats.chartData.map((d, i) => (
                          <Cell key={`cell-${i}`} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                         contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.topStudents.length > 0 ? (
                  stats.topStudents.map((sr) => (
                    <div key={`${sr.id}-${renderKey}`} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{sr.student.name}</p>
                        <p className="text-xs text-muted-foreground">{sr.student.rollNo}</p>
                      </div>
                      <Badge variant="secondary">{sr.obtainedMarks}</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No students found
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

function StatCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{children}</div>
      </CardContent>
    </Card>
  );
}