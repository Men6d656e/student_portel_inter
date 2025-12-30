
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Upload, Users, GraduationCap, School, Pencil, Trash2, ChevronLeft, ChevronRight, Loader, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useSession } from "@/lib/auth-client"
import { PageLoader } from "@/components/page-loader"
import { trpc } from "@/lib/trpc"

// Degrees and Years handled in the dedicated import page

export default function StudentsPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [classFilter, setClassFilter] = useState<"ALL" | "1st Year" | "2nd Year">("ALL")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1) // Reset to page 1 when search changes
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // tRPC hooks
  const utils = trpc.useUtils()
  const { data: statsData } = trpc.student.getStats.useQuery()
  const { data: studentsData, isLoading } = trpc.student.getAll.useQuery({
    limit: 10,
    page,
    search: debouncedSearch,
    classFilter,
  }, {
    // @ts-ignore
    keepPreviousData: true,
  })

  const deleteMutation = trpc.student.delete.useMutation({
    onSuccess: () => {
      toast.success("Student deleted successfully")
      utils.student.getAll.invalidate()
      utils.student.getStats.invalidate()
      setDeleteId(null)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  if (isPending) {
    return <PageLoader />
  }

  const students = studentsData?.students || []
  const totalStudents = statsData?.total || 0
  const firstYearCount = statsData?.firstYear || 0
  const secondYearCount = statsData?.secondYear || 0

  const resetUploadForm = () => {
    // Moved to dedicated import page
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate({ id: deleteId })
    }
  }

  const handleTabChange = (val: string) => {
    setClassFilter(val as any)
    setPage(1)
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground">Manage student records and monitor enrollment status.</p>
        </div>
        <div className="flex gap-2 sm:flex-row flex-col w-full sm:w-auto">
          <Button variant="outline" asChild className="hover:bg-primary/5 border-primary/10">
            <Link href="/dashboard/students/import">
              <Upload className="mr-2 h-4 w-4" /> Import Students
            </Link>
          </Button>
          <Button asChild className="shadow-lg shadow-primary/20 transition-all hover:scale-105">
            <Link href="/dashboard/students/new">
              <Plus className="mr-2 h-4 w-4" /> Add New Student
            </Link>
          </Button>
        </div>
      </div>

      {/* Analytics */}
      {!statsData ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="flex flex-col justify-between h-[120px]">
              <CardContent className="flex h-full items-center justify-center">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="bg-primary/5 border-primary/20 transition-all hover:bg-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground mt-1">Enrolled students</p>
            </CardContent>
          </Card>
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">1st Year Students</CardTitle>
              <School className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{firstYearCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Freshmen intake</p>
            </CardContent>
          </Card>
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">2nd Year Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{secondYearCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Senior students</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table with Tabs and Search */}
      <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle>Student Directory</CardTitle>
          <CardDescription>Comprehensive list of enrolled students by grade and degree.</CardDescription>
        </CardHeader>
        <CardContent>

          {isLoading && !studentsData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Tabs defaultValue="ALL" className="w-[400px]">
                  <TabsList>
                    <TabsTrigger value="ALL">All Students</TabsTrigger>
                    <TabsTrigger value="1st Year">1st Year</TabsTrigger>
                    <TabsTrigger value="2nd Year">2nd Year</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    className="pl-8"
                    value={searchQuery}
                    disabled
                  />
                </div>
              </div>

              <div className="rounded-md border h-[500px] flex items-center justify-center">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex  sm:flex-row flex-col gap-4">
                <div className="">
                  <Tabs defaultValue="ALL" onValueChange={handleTabChange} className="w-full">
                    <TabsList className="w-full">
                      <TabsTrigger value="ALL">All Students</TabsTrigger>
                      <TabsTrigger value="1st Year">1st Year</TabsTrigger>
                      <TabsTrigger value="2nd Year">2nd Year</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="relative sm:w-64 md:ml-auto w-full">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-md border p-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Degree</TableHead>
                      <TableHead>Session</TableHead>
                      <TableHead>Results</TableHead>

                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No students found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.rollNo}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.class}</TableCell>
                          <TableCell>{student.degree}</TableCell>
                          <TableCell>{student.session}</TableCell>
                          <TableCell>
                            {student._count.studentResults > 0 ? (
                              <Button variant="link" size="sm" asChild className="text-primary hover:text-primary/80 p-0 h-auto">
                                <Link href={`/dashboard/students/${student.id}/results`}>
                                  View Results
                                </Link>
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> No Results
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" asChild className="hover:bg-primary/5 hover:text-primary border-primary/10">
                                <Link href={`/dashboard/students/${student.id}`}>
                                  <Pencil className="mr-1 h-3 w-3" />
                                  Edit
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setDeleteId(student.id)}
                              >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center sm:justify-end justify-center space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {studentsData?.totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= (studentsData?.totalPages || 1) || isLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Modal logic removed and replaced with dedicated page */}


      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the student and their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}