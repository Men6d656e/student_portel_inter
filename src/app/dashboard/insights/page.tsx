"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function PerformanceHub() {
  const [selectedResultId, setSelectedResultId] = useState<string>("");

  // 1. Fetch all results uploaded by this teacher
  const { data: uploads } = trpc.uploadedResults.getMyUploads.useQuery({});

  // 2. Fetch the specific details for the selected result
  const { data: resultDetails, isLoading } = trpc.result.getById.useQuery(
    { id: selectedResultId },
    { enabled: !!selectedResultId }
  );

  // 3. Process data for the Donut Chart (Pass/Fail)
 const stats = useMemo(() => {
  // Provide clear defaults so chartData is NEVER undefined
  const defaultStats = { 
    pass: 0, 
    fail: 0, 
    avg: "0", 
    chartData: [
      { name: "Pass", value: 0, color: "var(--primary)" },
      { name: "Fail", value: 0, color: "var(--destructive)" }
    ] 
  };

  if (!resultDetails || !resultDetails.studentResults) return defaultStats;
  
  const total = resultDetails.studentResults.length;
  if (total === 0) return defaultStats;

  const passThreshold = resultDetails.totalMarks * 0.33;
  const pass = resultDetails.studentResults.filter(r => r.obtainedMarks >= passThreshold).length;
  const fail = total - pass;
  const avg = resultDetails.studentResults.reduce((acc, curr) => acc + curr.obtainedMarks, 0) / total;

  return {
    pass,
    fail,
    avg: avg.toFixed(1),
    chartData: [
      { name: "Pass", value: pass, color: "var(--primary)" },
      { name: "Fail", value: fail, color: "var(--destructive)" }
    ]
  };
}, [resultDetails]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
          <p className="text-muted-foreground">Track Your Class Performance</p>
        </div>

        {/* The Result Selector */}
        <Select onValueChange={setSelectedResultId}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a result to analyze" />
          </SelectTrigger>
          <SelectContent>
            {uploads?.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.subject} - {u.resultType} ({u.class})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedResultId ? (
        <Card className="flex flex-col items-center justify-center h-[400px] border-dashed">
          <p className="text-muted-foreground">Select a result from the dropdown to view performance metrics.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Top Row: Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Average Score</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{stats.avg} / {resultDetails?.totalMarks}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Passing Rate</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {((stats.pass / (stats.pass + stats.fail)) * 100).toFixed(0)}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Total Students</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{stats.pass + stats.fail}</div></CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut Chart: Pass/Fail */}
            <Card>
              <CardHeader>
                <CardTitle>Pass vs Fail Ratio</CardTitle>
                <CardDescription>Based on 33% passing marks</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.chartData}
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats && stats.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Students List */}
            <Card>
              <CardHeader><CardTitle>Top Performers</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resultDetails?.studentResults
                    .sort((a, b) => b.obtainedMarks - a.obtainedMarks)
                    .slice(0, 5)
                    .map((sr) => (
                      <div key={sr.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{sr.student.name}</p>
                          <p className="text-xs text-muted-foreground">{sr.student.rollNo}</p>
                        </div>
                        <Badge variant="secondary" className="text-primary font-bold">
                          {sr.obtainedMarks}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}