"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"
import { Loader, ArrowLeft, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
}

const resultTypeLabels: Record<string, string> = {
    DECEMBER_TEST: "December Test",
    MID_TERM: "Mid Term",
    FINAL: "Final",
    OTHER: "Other",
}

export default function ResultDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    const { data: result, isLoading } = trpc.result.getById.useQuery({ id: params.id })

    const deleteMutation = trpc.result.delete.useMutation({
        onSuccess: () => {
            toast.success("Result deleted successfully")
            router.push("/dashboard/results")
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })

    const handleDelete = () => {
        deleteMutation.mutate({ id: params.id })
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!result) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <p className="text-muted-foreground">Result not found</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Result Details</h1>
                        <p className="text-muted-foreground">
                            {subjectLabels[result.subject]} - {resultTypeLabels[result.resultType]}
                        </p>
                    </div>
                </div>
                <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Result
                </Button>
            </div>

            {/* Result Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Result Information</CardTitle>
                    <CardDescription>Details about this result upload</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Subject</p>
                        <p className="text-lg font-semibold">{subjectLabels[result.subject]}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Result Type</p>
                        <p className="text-lg font-semibold">{resultTypeLabels[result.resultType]}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Marks</p>
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
                        <p className="text-sm font-medium text-muted-foreground">Uploaded By</p>
                        <p className="text-lg font-semibold">{result.uploadedBy.name || result.uploadedBy.email}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Upload Date</p>
                        <p className="text-lg font-semibold">
                            {new Date(result.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                        <p className="text-lg font-semibold">{result.studentResults.length}</p>
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
                                const percentage = ((sr.obtainedMarks / result.totalMarks) * 100).toFixed(2)
                                return (
                                    <TableRow key={sr.id}>
                                        <TableCell className="font-medium">{sr.student.rollNo}</TableCell>
                                        <TableCell>{sr.student.name}</TableCell>
                                        <TableCell>{sr.obtainedMarks}</TableCell>
                                        <TableCell>{result.totalMarks}</TableCell>
                                        <TableCell>{percentage}%</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Result</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this result? This will also delete all {result.studentResults.length} student marks. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
