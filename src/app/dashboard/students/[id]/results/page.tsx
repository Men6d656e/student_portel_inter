"use client"

import { use, useMemo } from "react"
import { trpc } from "@/lib/trpc"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    ChevronLeft,
    GraduationCap,
    BookOpen,
    Calendar,
    Trophy,
    AlertCircle
} from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export default function StudentResultsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { data: student, isLoading } = trpc.student.getWithResults.useQuery({ id })

    const stats = useMemo(() => {
        if (!student?.studentResults?.length) return null

        const results = student.studentResults
        const totalMarks = results.reduce((acc, r) => acc + r.result.totalMarks, 0)
        const obtainedMarks = results.reduce((acc, r) => acc + r.obtainedMarks, 0)
        const percentage = (obtainedMarks / totalMarks) * 100

        const passCount = results.filter(r => (r.obtainedMarks / r.result.totalMarks) >= 0.33).length
        const failCount = results.length - passCount

        return {
            averagePercentage: percentage.toFixed(1),
            totalMarks,
            obtainedMarks,
            passCount,
            failCount,
            totalExams: results.length
        }
    }, [student])

    if (isLoading) {
        return (
            <div className="p-8 space-y-8">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <Skeleton className="h-[120px]" />
                    <Skeleton className="h-[120px]" />
                    <Skeleton className="h-[120px]" />
                </div>
                <Skeleton className="h-[400px] w-full" />
            </div>
        )
    }

    if (!student) {
        return (
            <div className="p-8 flex flex-col items-center justify-center h-[60vh] space-y-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <h2 className="text-2xl font-bold">Student Not Found</h2>
                <Button asChild>
                    <Link href="/dashboard/students">Back to Students</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                            <Link href="/dashboard/students">
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">{student.name}</h1>
                    </div>
                    <div className="flex items-center gap-4 ml-10 text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" /> {student.rollNo}
                        </span>
                        <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" /> {student.degree}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" /> {student.session}
                        </span>
                    </div>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-1">
                    {student.class}
                </Badge>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overall Percentage</CardTitle>
                            <Trophy className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">{stats.averagePercentage}%</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.obtainedMarks} / {stats.totalMarks} total marks
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Exam Performance</CardTitle>
                            <Badge variant={stats.failCount > 0 ? "destructive" : "secondary"}>
                                {stats.passCount} Passed
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalExams}</div>
                            <p className="text-xs text-muted-foreground">
                                Total examinations taken
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Current Status</CardTitle>
                            <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
                                ACTIVE
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{student.class}</div>
                            <p className="text-xs text-muted-foreground">
                                Currently enrolled
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Results Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Academic Records</CardTitle>
                    <CardDescription>A comprehensive list of all exam results for this student.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Result Type</TableHead>
                                    <TableHead>Obtained Marks</TableHead>
                                    <TableHead>Total Marks</TableHead>
                                    <TableHead>Percentage</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!student.studentResults?.length ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No results uploaded for this student yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    student.studentResults.map((sr) => {
                                        const percentage = (sr.obtainedMarks / sr.result.totalMarks) * 100
                                        const isPassed = percentage >= 33

                                        return (
                                            <TableRow key={sr.id} className="hover:bg-muted/50 transition-colors">
                                                <TableCell className="font-medium">{sr.result.subject}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-normal capitalize">
                                                        {sr.result.resultType.replace(/_/g, " ").toLowerCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-semibold">{sr.obtainedMarks}</TableCell>
                                                <TableCell>{sr.result.totalMarks}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${isPassed ? 'bg-primary' : 'bg-destructive'}`}
                                                                style={{ width: `${Math.min(100, percentage)}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm">{percentage.toFixed(1)}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={isPassed ? "secondary" : "destructive"}
                                                        className={isPassed ? "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20" : ""}
                                                    >
                                                        {isPassed ? "Pass" : "Fail"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {new Date(sr.result.createdAt).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
