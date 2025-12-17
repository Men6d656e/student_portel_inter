
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Upload, Users, GraduationCap, School, Pencil, Trash2, ChevronLeft, ChevronRight, Loader } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileUpload } from "@/components/ui/file-upload"
import { processFile, StudentData } from "@/lib/fileProcessors"
import { trpc } from "@/lib/trpc"

const degrees = [
  { label: "Medical", value: "Medical" },
  { label: "Non-Medical", value: "Non-Medical" },
  { label: "Computer Science (ICS)", value: "ICS" },
  { label: "Arts (FA)", value: "FA" },
]

const generateYears = () => {
  const years = []
  for (let year = 2020; year <= 2031; year++) {
    years.push({ label: year.toString(), value: year.toString() })
  }
  return years
}

export default function StudentsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [classFilter, setClassFilter] = useState<"ALL" | "1st Year" | "2nd Year">("ALL")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedDegree, setSelectedDegree] = useState<string>("")
  const [selectedStartYear, setSelectedStartYear] = useState<string>("")
  const [selectedEndYear, setSelectedEndYear] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState("")

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

  const bulkCreateMutation = trpc.student.bulkCreate.useMutation({
    onSuccess: (data) => {
      toast.success(data.message)
      utils.student.getAll.invalidate()
      utils.student.getStats.invalidate()
      setUploadDialogOpen(false)
      resetUploadForm()
    },
    onError: (error) => {
      toast.error(error.message)
      setIsProcessing(false)
    },
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

  const students = studentsData?.students || []
  const totalStudents = statsData?.total || 0
  const firstYearCount = statsData?.firstYear || 0
  const secondYearCount = statsData?.secondYear || 0

  const resetUploadForm = () => {
    setSelectedFile(null)
    setSelectedClass("")
    setSelectedDegree("")
    setSelectedStartYear("")
    setSelectedEndYear("")
    setIsProcessing(false)
    setProcessingProgress(0)
    setProcessingStatus("")
  }

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0])
    }
  }

  const handleImportSubmit = async () => {
    if (!selectedFile || !selectedClass || !selectedDegree || !selectedStartYear || !selectedEndYear) {
      toast.error("Please select a file, class, degree, start year, and end year")
      return
    }

    // Combine start and end year into session
    const session = `${selectedStartYear}-${selectedEndYear}`

    setIsProcessing(true)
    setProcessingStatus("Processing file...")
    setProcessingProgress(0)

    try {
      // Process the file to extract student data
      const extractedData: StudentData[] = await processFile(
        selectedFile,
        (progress) => {
          setProcessingProgress(progress)
          setProcessingStatus(`Extracting data... ${progress}%`)
        }
      )

      setProcessingStatus(`Extracted ${extractedData.length} students. Saving to database...`)
      setProcessingProgress(100)

      // Prepare data for bulk create
      const studentsToCreate = extractedData.map((student) => ({
        name: student.name,
        rollNo: student.rollNo,
        class: selectedClass,
        degree: selectedDegree,
        session,
      }))

      // Call tRPC mutation
      await bulkCreateMutation.mutateAsync({ students: studentsToCreate })
    } catch (error) {
      toast.error((error as Error).message || "Failed to process file")
      setIsProcessing(false)
    }
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
    <div className="p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground">Manage student records and enrollments.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Import Students
          </Button>
          <Button asChild>
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
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">1st Year Students</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{firstYearCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">2nd Year Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{secondYearCount}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table with Tabs and Search */}
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
          <div className="flex items-center justify-between">
            <Tabs defaultValue="ALL" onValueChange={handleTabChange} className="w-[400px]">
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
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Degree</TableHead>
                  <TableHead>Session</TableHead>
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/students/${student.id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteId(student.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
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
          <div className="flex items-center justify-end space-x-2 py-4">
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

      {/* File Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={(open) => {
        setUploadDialogOpen(open)
        if (!open) resetUploadForm()
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Import Students</DialogTitle>
            <DialogDescription>
              Upload a CSV or Excel file containing student data (name and rollNo columns), or an image with student information.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Class, Degree, and Session Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass} disabled={isProcessing}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st Year">1st Year</SelectItem>
                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Degree</Label>
                <Select value={selectedDegree} onValueChange={setSelectedDegree} disabled={isProcessing}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Degree" />
                  </SelectTrigger>
                  <SelectContent>
                    {degrees.map((d) => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Year</Label>
                <Select value={selectedStartYear} onValueChange={setSelectedStartYear} disabled={isProcessing}>
                  <SelectTrigger>
                    <SelectValue placeholder="Start Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateYears().map((y) => (
                      <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>End Year</Label>
                <Select value={selectedEndYear} onValueChange={setSelectedEndYear} disabled={isProcessing}>
                  <SelectTrigger>
                    <SelectValue placeholder="End Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateYears().map((y) => (
                      <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* File Upload Area */}
            {!isProcessing && (
              <div className="w-full border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
                <FileUpload onChange={handleFileSelect} />
              </div>
            )}

            {/* Processing State */}
            {isProcessing && (
              <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <Loader className="h-12 w-12 animate-spin text-primary" />
                <div className="text-center space-y-2">
                  <p className="font-medium">{processingStatus}</p>
                  {processingProgress > 0 && (
                    <div className="w-full max-w-xs mx-auto bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${processingProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleImportSubmit} disabled={!selectedFile || !selectedClass || !selectedDegree || !selectedStartYear || !selectedEndYear || isProcessing}>
              {isProcessing ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Import Students"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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