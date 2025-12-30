"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader, ArrowLeft, Users, Upload } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { processFile } from "@/lib/fileProcessors";
import { useSession } from "@/lib/auth-client";
import { PageLoader } from "@/components/page-loader";

const degrees = [
    { label: "Medical", value: "Medical" },
    { label: "Non-Medical", value: "Non-Medical" },
    { label: "Computer Science (ICS)", value: "ICS" },
    { label: "Arts (FA)", value: "FA" },
];

const generateYears = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
        years.push({ label: year.toString(), value: year.toString() });
    }
    return years;
};

const years = generateYears();

export default function StudentImportPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();

    const [selectedClass, setSelectedClass] = useState("");
    const [selectedDegree, setSelectedDegree] = useState("");
    const [selectedStartYear, setSelectedStartYear] = useState("");
    const [selectedEndYear, setSelectedEndYear] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState("");
    const [processingProgress, setProcessingProgress] = useState(0);

    const bulkCreateMutation = trpc.student.bulkCreate.useMutation({
        onSuccess: (data) => {
            toast.success(data.message);
            router.push("/dashboard/students");
        },
        onError: (error) => {
            toast.error(error.message);
            setIsProcessing(false);
        },
    });

    if (isPending) {
        return <PageLoader />;
    }

    const handleFileSelect = (files: File[]) => {
        if (files.length > 0) {
            setSelectedFile(files[0]);
        }
    };

    const handleImportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !selectedFile ||
            !selectedClass ||
            !selectedDegree ||
            !selectedStartYear ||
            !selectedEndYear
        ) {
            toast.error("Please fill all fields and select a file");
            return;
        }

        const sessionString = `${selectedStartYear}-${selectedEndYear}`;

        setIsProcessing(true);
        setProcessingStatus("Processing file...");
        setProcessingProgress(0);

        try {
            const extractedData = await processFile(
                selectedFile,
                (progress) => {
                    setProcessingProgress(progress);
                    setProcessingStatus(`Extracting data... ${progress}%`);
                }
            );

            setProcessingStatus(`Extracted ${extractedData.length} students. Saving...`);
            setProcessingProgress(100);

            const studentsToCreate = extractedData.map((student) => ({
                name: student.name,
                rollNo: student.rollNo,
                class: selectedClass,
                degree: selectedDegree,
                session: sessionString,
            }));

            await bulkCreateMutation.mutateAsync({ students: studentsToCreate });
        } catch (error: any) {
            toast.error(error.message || "Failed to process file");
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6 p-8">
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Import Students</h1>
                    <p className="text-muted-foreground">
                        Batch process student records from CSV or Microsoft Excel.
                    </p>
                </div>
            </div>

            <Card className="">
                <CardHeader>
                    <CardTitle>Import Information</CardTitle>
                    <CardDescription>
                        Specify the academic details for the students being imported.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleImportSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label>Target Class</Label>
                                <Select
                                    value={selectedClass}
                                    onValueChange={setSelectedClass}
                                    disabled={isProcessing}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1st Year">1st Year</SelectItem>
                                        <SelectItem value="2nd Year">2nd Year</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Degree Program</Label>
                                <Select
                                    value={selectedDegree}
                                    onValueChange={setSelectedDegree}
                                    disabled={isProcessing}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Program" />
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

                            <div className="space-y-2">
                                <Label>Start Year</Label>
                                <Select
                                    value={selectedStartYear}
                                    onValueChange={setSelectedStartYear}
                                    disabled={isProcessing}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Start" />
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

                            <div className="space-y-2">
                                <Label>End Year</Label>
                                <Select
                                    value={selectedEndYear}
                                    onValueChange={setSelectedEndYear}
                                    disabled={isProcessing}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="End" />
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
                        </div>

                        <div className="space-y-2">
                            <Label>Student Records File</Label>
                            {!isProcessing ? (
                                <div className="w-full border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
                                    <FileUpload onChange={handleFileSelect} />
                                </div>
                            ) : (
                                <div className="h-48 flex flex-col items-center justify-center p-8 space-y-6 bg-primary/5 rounded-2xl border-2 border-primary/10">
                                    <div className="relative">
                                        <Loader className="h-12 w-12 animate-spin text-primary" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Users className="h-4 w-4 text-primary" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-3 w-full max-w-sm">
                                        <p className="font-semibold text-lg text-primary">{processingStatus}</p>
                                        <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden ring-1 ring-primary/20">
                                            <div
                                                className="bg-primary h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                                                style={{ width: `${processingProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {selectedFile && !isProcessing && (
                                <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10 animate-in slide-in-from-left-2">
                                    <Upload className="h-4 w-4 text-primary" />
                                    <p className="text-sm font-medium">
                                        Selected: <span className="text-primary">{selectedFile.name}</span>
                                    </p>
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground italic px-1">
                                Note: Ensure your file has "name" and "rollNo" columns for proper data extraction.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isProcessing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isProcessing || !selectedFile || !selectedClass || !selectedDegree || !selectedStartYear || !selectedEndYear}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Start Import
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
