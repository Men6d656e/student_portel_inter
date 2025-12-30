"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth-client";
import { Loader, Search, Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PageLoader } from "@/components/page-loader";

// Reusing constants from Upload Result to ensure consistency
const resultTypes = [
    { label: "All Types", value: "ALL" },
    { label: "December Test", value: "DECEMBER_TEST" },
    { label: "Mid Term", value: "MID_TERM" },
    { label: "Other", value: "OTHER" },
];

const degrees = [
    { label: "Medical", value: "Medical" },
    { label: "Non-Medical", value: "Non-Medical" },
    { label: "Computer Science (ICS)", value: "ICS" },
    { label: "Arts (FA)", value: "FA" },
];

const generateYears = () => {
    const years = [];
    for (let year = 2020; year <= 2031; year++) {
        years.push({ label: year.toString(), value: year.toString() });
    }
    return years;
};

const years = generateYears();

export default function SearchResultPage() {
    const { data: session, isPending } = useSession();
    const userRole = (session?.user as any)?.role;


    const [formData, setFormData] = useState({
        rollNo: "",
        startYear: "",
        endYear: "",
        degree: "",
        class: "",
        resultType: "ALL",
    });

    const [searchResults, setSearchResults] = useState<any[] | null>(null);
    const [studentInfo, setStudentInfo] = useState<{ name: string; rollNo: string } | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const searchMutation = trpc.result.searchStudentResults.useMutation({
        onSuccess: (data: any) => {
            setHasSearched(true);
            setSearchResults(data);
            if (data.length > 0) {
                setStudentInfo({ name: data[0].studentName, rollNo: data[0].rollNo });
                toast.success(`Found ${data.length} results`);
            } else {
                setStudentInfo(null);
            }
        },
        onError: (error: any) => {
            setHasSearched(true);
            setSearchResults(null);
            setStudentInfo(null);
            toast.error(error.message);
        },
    });

    if (isPending) {
        return <PageLoader />;
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !formData.rollNo ||
            !formData.startYear ||
            !formData.endYear ||
            !formData.degree ||
            !formData.class ||
            !formData.resultType
        ) {
            toast.error("Please fill all search fields");
            return;
        }

        const sessionStr = `${formData.startYear}-${formData.endYear}`;
        searchMutation.mutate({
            rollNo: formData.rollNo,
            session: sessionStr,
            class: formData.class,
            degree: formData.degree,
            resultType: formData.resultType as any,
        });
    };



    const handleDownload = () => {
        if (!searchResults || searchResults.length === 0 || !studentInfo) {
            toast.error("No results to download");
            return;
        }

        try {
            toast.success("Downloading result card...");

            // Prepare data for Excel
            const exportData = searchResults.map(result => ({
                Subject: result.subject,
                "Result Type": result.resultType ? result.resultType.replace("_", " ") : "-",
                "Total Marks": result.totalMarks,
                "Obtained Marks": result.obtainedMarks,
                "Percentage": `${result.percentage}%`,
                "Grade": result.grade
            }));

            // Calculate totals
            const totalMarks = searchResults.reduce((sum, item) => sum + item.totalMarks, 0);
            const obtainedMarks = searchResults.reduce((sum, item) => sum + item.obtainedMarks, 0);
            const overallPercentage = totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(2) : "0";

            // Add summary row
            exportData.push({
                Subject: "Grand Total",
                "Result Type": "-",
                "Total Marks": totalMarks,
                "Obtained Marks": obtainedMarks,
                "Percentage": `${overallPercentage}%`,
                "Grade": "-"
            });

            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(exportData);

            // Add student info to a separate sheet or header? 
            // For simplicity, let's make a filename with student info and just data in sheet.
            // Or typically we prepend info. But json_to_sheet is simple.
            // Let's stick to the data table for the sheet.

            XLSX.utils.book_append_sheet(wb, ws, "Result Card");
            XLSX.writeFile(wb, `Result_Card_${studentInfo.rollNo}.xlsx`);

            toast.success("Download complete");
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Failed to download result card");
        }
    };

    return (
        <div className="space-y-6 p-8 w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
                <p className="text-muted-foreground">
                    Find and view detailed student result cards
                </p>
            </div>

            {/* SEARCH FORM */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Search Criteria</CardTitle>
                    <CardDescription>
                        Enter student details to fetch their report card
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="space-y-6">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-4">
                                <div className="space-y-2 lg:col-span-2">
                                    <Label htmlFor="rollNo">College Roll No</Label>
                                    <Input
                                        id="rollNo"
                                        placeholder="e.g. 123456"
                                        value={formData.rollNo}
                                        onChange={(e) =>
                                            setFormData({ ...formData, rollNo: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="space-y-2 lg:col-span-2">
                                    <Label>Session Start</Label>
                                    <Select
                                        onValueChange={(val) =>
                                            setFormData({ ...formData, startYear: val })
                                        }
                                        value={formData.startYear}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {years.map((y) => (
                                                <SelectItem key={y.value} value={y.value}>
                                                    {y.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 lg:col-span-2">
                                    <Label>Session End</Label>
                                    <Select
                                        onValueChange={(val) =>
                                            setFormData({ ...formData, endYear: val })
                                        }
                                        value={formData.endYear}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {years.map((y) => (
                                                <SelectItem key={y.value} value={y.value}>
                                                    {y.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 lg:col-span-2">
                                    <Label>Class</Label>
                                    <Select
                                        onValueChange={(val) =>
                                            setFormData({ ...formData, class: val })
                                        }
                                        value={formData.class}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1st Year">1st Year</SelectItem>
                                            <SelectItem value="2nd Year">2nd Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 lg:col-span-2">
                                    <Label>Degree</Label>
                                    <Select
                                        onValueChange={(val) =>
                                            setFormData({ ...formData, degree: val })
                                        }
                                        value={formData.degree}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Degree" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {degrees.map((d) => (
                                                <SelectItem key={d.value} value={d.value}>
                                                    {d.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 lg:col-span-2">
                                    <Label>Result Type</Label>
                                    <Select
                                        onValueChange={(val) =>
                                            setFormData({ ...formData, resultType: val })
                                        }
                                        value={formData.resultType}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="All Types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {resultTypes.map((rt) => (
                                                <SelectItem key={rt.value} value={rt.value}>
                                                    {rt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button type="submit" size="lg" disabled={searchMutation.isPending} className="w-full">
                                {searchMutation.isPending ? (
                                    <>
                                        <Loader className="mr-2 h-5 w-5 animate-spin" />
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <Search className="mr-2 h-5 w-5" />
                                        Search Result
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* RESULT CARD - Always rendered after search initiated */}
            <Card className="w-full shadow-lg min-h-[400px]">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">Result Card</CardTitle>
                        <CardDescription className="mt-1">
                            {studentInfo
                                ? `${studentInfo.name} • ${studentInfo.rollNo}`
                                : "Detailed result breakdown"}
                        </CardDescription>
                    </div>
                    {studentInfo && userRole === "ADMIN" && (
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    {searchMutation.isPending ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader className="h-10 w-10 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground">Fetching result data...</p>
                        </div>
                    ) : !hasSearched ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                            <Search className="h-10 w-10 mb-4 opacity-20" />
                            <p>Enter search criteria to view results</p>
                        </div>
                    ) : searchResults && searchResults.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table className="border-t">
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="py-4 px-6">Subject</TableHead>
                                        <TableHead className="py-4 px-6">Result Type</TableHead>
                                        <TableHead className="text-center py-4 px-6">Total Marks</TableHead>
                                        <TableHead className="text-center py-4 px-6">Obtained</TableHead>
                                        <TableHead className="text-center py-4 px-6">Percentage</TableHead>
                                        <TableHead className="text-center py-4 px-6">Grade</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {searchResults.map((result) => (
                                        <TableRow key={result.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium p-4 px-6">{result.subject}</TableCell>
                                            <TableCell className="p-4 px-6">{result.resultType ? result.resultType.replace("_", " ") : "-"}</TableCell>
                                            <TableCell className="text-center p-4 px-6">{result.totalMarks}</TableCell>
                                            <TableCell className="text-center p-4 px-6">
                                                <span className={result.percentage < 33 ? "text-destructive font-bold" : "text-primary font-bold"}>
                                                    {result.obtainedMarks}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center p-4 px-6">{result.percentage}%</TableCell>
                                            <TableCell className="text-center p-4 px-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.grade === "F" ? "bg-destructive/10 text-destructive" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                    }`}>
                                                    {result.grade}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {/* Total Summary Row */}
                                    {/* <TableRow className="bg-primary/5 font-bold border-t-2 border-primary/20">
                                        <TableCell className="p-4 px-6">Grand Total</TableCell>
                                        <TableCell className="p-4 px-6">-</TableCell>
                                        <TableCell className="text-center p-4 px-6">{searchResults.reduce((a, b) => a + b.totalMarks, 0)}</TableCell>
                                        <TableCell className="text-center p-4 px-6 text-primary">{searchResults.reduce((a, b) => a + b.obtainedMarks, 0)}</TableCell>
                                        <TableCell className="text-center p-4 px-6">
                                            {(
                                                (searchResults.reduce((a, b) => a + b.obtainedMarks, 0) /
                                                    searchResults.reduce((a, b) => a + b.totalMarks, 0)) * 100
                                            ).toFixed(2)}%
                                        </TableCell>
                                        <TableCell className="text-center p-4 px-6">-</TableCell>
                                    </TableRow> */}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-dashed">
                            <FileSpreadsheet className="h-10 w-10 mb-4 opacity-20" />
                            <p>No results found for {studentInfo ? `${studentInfo.name}` : "this query"}.</p>
                            <p className="text-xs mt-1">Try adjusting the filter criteria (e.g. check "All Types")</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
