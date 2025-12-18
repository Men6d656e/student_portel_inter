"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Loader, GraduationCap  } from "lucide-react";

import { useMemo } from "react";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Pie, XAxis ,PieChart} from "recharts";

const subjectLabels: Record<string, string> = {
  ENGLISH: "English",
  URDU: "Urdu",
  PHYSICS: "Physics",
  CHEMISTRY: "Chemistry",
  BIOLOGY: "Biology",
  THQ: "THQ",
  PAK_STUDY: "Pak Study",
  MATH: "Math",
  STAT: "Statistics",
  ECONOMICS: "Economics",
  COMPUTER: "Computer",
  SOCIOLOGY: "Sociology",
  EDUCATION: "Education",
  ISL_ELE: "Isl (Ele.)",
  H_AND_P_EDUCATION: "H&P Education",
  PSYCHOLOGY: "Psychology",
};

const resultTypeLabels: Record<string, string> = {
  DECEMBER_TEST: "December Test",
  MID_TERM: "Mid Term",
  OTHER: "Other",
};

export default function ResultDetailsPage() {
  const params: { id: string } = useParams();
  const router = useRouter();

  const { data: result, isLoading } = trpc.result.getById.useQuery({
    id: params.id,
  });


  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-muted-foreground">Result not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const chartData = useMemo(() => {
    if (!result) return null;
    const totalStudents = result.studentResults.length;
    const passThreshold = result.totalMarks * 0.4; // Assuming 40% is the passing mark

    // 1. Pass/Fail Data
    const passed = result.studentResults.filter(
      (sr) => sr.obtainedMarks >= passThreshold
    ).length;
    const failed = totalStudents - passed;

    const passFailData = [
      { status: "Passed (≥40%)", count: passed, fill: "hsl(var(--chart-2))" },
      { status: "Failed (<40%)", count: failed, fill: "hsl(var(--chart-1))" },
    ];
    // 2. Score Ranges (Histogram)
    const ranges = [
      { range: "0-20", count: 0 },
      { range: "21-40", count: 0 },
      { range: "41-60", count: 0 },
      { range: "61-80", count: 0 },
      { range: "81-100", count: 0 },
    ];

    result.studentResults.forEach((sr) => {
      const marks = sr.obtainedMarks;
      if (marks <= 20) ranges[0].count++;
      else if (marks <= 40) ranges[1].count++;
      else if (marks <= 60) ranges[2].count++;
      else if (marks <= 80) ranges[3].count++;
      else ranges[4].count++;
    });
    return { passFailData, ranges };
  }, [result]);

  const chartConfig = {
    count: { label: "Students" },
    passed: { label: "Passed", color: "hsl(var(--chart-2))" },
    failed: { label: "Failed", color: "hsl(var(--chart-1))" },
  } satisfies ChartConfig;

    if (isLoading || !result || !chartData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Result Information */}
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader>
          <CardTitle className="">
            <div className="flex justify-center items-center gap-5">
              <div className="p-2 rounded-full bg-primary/10">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-extrabold text-center">
                Goverment Graduate Satiana College, Faisalabad
              </h1>
            </div>
          </CardTitle>
          <CardDescription className="text-center">
            Details about this result upload
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Subject</p>
            <p className="text-lg font-semibold">
              {subjectLabels[result.subject]}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Result Type
            </p>
            <p className="text-lg font-semibold">
              {resultTypeLabels[result.resultType]}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Marks
            </p>
            <p className="text-lg font-semibold">{result.totalMarks}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Class</p>
            <p className="text-lg font-semibold">{result.class}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Degree</p>
            <p className="text-lg font-semibold">{result.degree}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Session</p>
            <p className="text-lg font-semibold">{result.session}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Uploaded By
            </p>
            <p className="text-lg font-semibold">
              {result.uploadedBy.name || result.uploadedBy.email}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Upload Date
            </p>
            <p className="text-lg font-semibold">
              {new Date(result.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Students
            </p>
            <p className="text-lg font-semibold">
              {result.studentResults.length}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Student Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Marks</CardTitle>
          <CardDescription>Individual marks for each student</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Obtained Marks</TableHead>
                <TableHead>Total Marks</TableHead>
                <TableHead>Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.studentResults.map((sr) => {
                const percentage = (
                  (sr.obtainedMarks / result.totalMarks) *
                  100
                ).toFixed(2);
                return (
                  <TableRow key={sr.id}>
                    <TableCell className="font-medium">
                      {sr.student.rollNo}
                    </TableCell>
                    <TableCell>{sr.student.name}</TableCell>
                    <TableCell>{sr.obtainedMarks}</TableCell>
                    <TableCell>{result.totalMarks}</TableCell>
                    <TableCell>{percentage}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
