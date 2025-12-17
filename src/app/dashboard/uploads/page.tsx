
"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Plus, Search, LayoutGrid, List, MoreHorizontal, FileText, Trash2, Pencil, Eye } from "lucide-react"
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
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Mock Data Type
type UploadResult = {
    id: string
    subject: string
    degree: string
    totalMarks: number
    date: string
    classYear: "1st Year" | "2nd Year"
    fileName: string
}

// Mock Data
const mockUploads: UploadResult[] = [
    { id: "1", subject: "Physics", degree: "Medical", totalMarks: 100, date: "2024-05-20", classYear: "1st Year", fileName: "phys_med_1st.xlsx" },
    { id: "2", subject: "Math", degree: "ICS", totalMarks: 100, date: "2024-05-21", classYear: "2nd Year", fileName: "math_ics_2nd.csv" },
    { id: "3", subject: "Chemistry", degree: "Nom-Medical", totalMarks: 100, date: "2024-05-22", classYear: "1st Year", fileName: "chem_nm_1st.xlsx" },
]

export default function UploadsPage() {
    const router = useRouter()
    const [viewMode, setViewMode] = useState<"table" | "grid">("table")
    const [searchQuery, setSearchQuery] = useState("")
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const filteredUploads = mockUploads.filter(upload =>
        upload.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        upload.degree.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getUploadsByYear = (year: "1st Year" | "2nd Year") => {
        return filteredUploads.filter(u => u.classYear === year)
    }

    const handleDelete = () => {
        if (deleteId) {
            toast.success("Result deleted successfully")
            setDeleteId(null)
            // Logic to remove from state/db would go here
        }
    }

    const UploadCard = ({ upload }: { upload: UploadResult }) => (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {upload.subject}
                </CardTitle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/uploads/${upload.id}`)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(upload.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{upload.degree}</div>
                <p className="text-xs text-muted-foreground">
                    Marks: {upload.totalMarks} | {upload.date}
                </p>
                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                    <FileText className="mr-1 h-4 w-4" />
                    {upload.fileName}
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Your Result Uploaded</h1>
                    <p className="text-muted-foreground">Manage your uploaded result sheets here.</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/uploads/new">
                        <Plus className="mr-2 h-4 w-4" /> Add New Result
                    </Link>
                </Button>
            </div>

            <Tabs defaultValue="1st Year" className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <TabsList>
                        <TabsTrigger value="1st Year">1st Year</TabsTrigger>
                        <TabsTrigger value="2nd Year">2nd Year</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search results..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex border rounded-md">
                            <Button
                                variant={viewMode === "table" ? "default" : "ghost"}
                                size="icon"
                                onClick={() => setViewMode("table")}
                                className="rounded-r-none"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === "grid" ? "default" : "ghost"}
                                size="icon"
                                onClick={() => setViewMode("grid")}
                                className="rounded-l-none"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content Renderers */}
                {["1st Year", "2nd Year"].map((year) => (
                    <TabsContent key={year} value={year} className="space-y-4">
                        {viewMode === "table" ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">ID</TableHead>
                                            <TableHead>Subject Name</TableHead>
                                            <TableHead>Degree</TableHead>
                                            <TableHead>Total Marks</TableHead>
                                            <TableHead>Files</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {getUploadsByYear(year as "1st Year" | "2nd Year").map((upload) => (
                                            <TableRow key={upload.id}>
                                                <TableCell className="font-medium">{upload.id}</TableCell>
                                                <TableCell>{upload.subject}</TableCell>
                                                <TableCell>{upload.degree}</TableCell>
                                                <TableCell>{upload.totalMarks}</TableCell>
                                                <TableCell>{upload.fileName}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/uploads/${upload.id}`)}>
                                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon">
                                                            <Pencil className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(upload.id)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {getUploadsByYear(year as any).length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center">
                                                    No results found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {getUploadsByYear(year as any).map((upload) => (
                                    <UploadCard key={upload.id} upload={upload} />
                                ))}
                                {getUploadsByYear(year as any).length === 0 && (
                                    <div className="col-span-full h-24 flex items-center justify-center text-muted-foreground border border-dashed rounded-lg">
                                        No results found.
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the uploaded result and all associated student marks.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
