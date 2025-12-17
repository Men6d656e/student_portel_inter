"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader, Plus, Search, ChevronLeft, ChevronRight, Pencil, Trash2, FileText, ClipboardList, BookOpen, GraduationCap } from "lucide-react"
import { trpc } from "@/lib/trpc"

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

export default function ResultsPage() {
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [resultTypeFilter, setResultTypeFilter] = useState<"ALL" | "DECEMBER_TEST" | "MID_TERM" | "FINAL" | "OTHER">("ALL")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // tRPC hooks
  const utils = trpc.useUtils()
  const { data: statsData } = trpc.result.getStats.useQuery()
  const { data: resultsData, isLoading } = trpc.result.getAll.useQuery({
    limit: 10,
    page,
    search: debouncedSearch,
    resultTypeFilter,
  })

  const deleteMutation = trpc.result.delete.useMutation({
    onSuccess: () => {
      toast.success("Result deleted successfully")
      utils.result.getAll.invalidate()
      utils.result.getStats.invalidate()
      setDeleteId(null)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate({ id: deleteId })
    }
  }

  const handleTabChange = (val: string) => {
    setResultTypeFilter(val as any)
    setPage(1)
  }

  const results = resultsData?.results || []
  const totalPages = resultsData?.totalPages || 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Results</h1>
          <p className="text-muted-foreground">Manage student results and uploads</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/results/new">
            <Plus className="mr-2 h-4 w-4" />
            Upload Result
          </Link>
        </Button>
      </div>

      {/* Analytics Cards */}
      {!statsData ? (
        <div className="grid gap-4 md:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="flex flex-col justify-between h-[120px]">
              <CardContent className="flex h-full items-center justify-center">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Results</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">December Test</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.decemberTest}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mid Term</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.midTerm}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Final</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.final}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Other</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.other}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Results</CardTitle>
              <CardDescription>View and manage uploaded results</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search results..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={resultTypeFilter} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="ALL">All</TabsTrigger>
              <TabsTrigger value="DECEMBER_TEST">December</TabsTrigger>
              <TabsTrigger value="MID_TERM">Mid Term</TabsTrigger>
              <TabsTrigger value="FINAL">Final</TabsTrigger>
              <TabsTrigger value="OTHER">Other</TabsTrigger>
            </TabsList>

            <TabsContent value={resultTypeFilter} className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Degree</TableHead>
                        <TableHead>Session</TableHead>
                        <TableHead>Total Marks</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Uploaded By</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="h-24 text-center">
                            No results found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        results.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell className="font-medium">{subjectLabels[result.subject]}</TableCell>
                            <TableCell>{resultTypeLabels[result.resultType]}</TableCell>
                            <TableCell>{result.class}</TableCell>
                            <TableCell>{result.degree}</TableCell>
                            <TableCell>{result.session}</TableCell>
                            <TableCell>{result.totalMarks}</TableCell>
                            <TableCell>{result._count.studentResults}</TableCell>
                            <TableCell>{result.uploadedBy.name || result.uploadedBy.email}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/dashboard/results/${result.id}`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    View
                                  </Link>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDeleteId(result.id)}
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

                  {/* Pagination */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Result</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this result? This will also delete all associated student marks. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
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