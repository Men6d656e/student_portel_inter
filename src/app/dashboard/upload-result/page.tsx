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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader, ArrowLeft, Upload } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { processResultFile } from "@/lib/fileProcessors";

const subjects = [
  { label: "English", value: "ENGLISH" },
  { label: "Urdu", value: "URDU" },
  { label: "Physics", value: "PHYSICS" },
  { label: "Chemistry", value: "CHEMISTRY" },
  { label: "Biology", value: "BIOLOGY" },
  { label: "THQ", value: "THQ" },
  { label: "Pak Study", value: "PAK_STUDY" },
  { label: "Math", value: "MATH" },
  { label: "Statistics", value: "STAT" },
  { label: "Economics", value: "ECONOMICS" },
  { label: "Computer", value: "COMPUTER" },
  { label: "Sociology", value: "SOCIOLOGY" },
  { label: "Education", value: "EDUCATION" },
  { label: "Isl (Ele.)", value: "ISL_ELE" },
  { label: "H&P Education", value: "H_AND_P_EDUCATION" },
  { label: "Psychology", value: "PSYCHOLOGY" },
];

const resultTypes = [
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

export default function UploadResultPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    subject: "",
    resultType: "",
    totalMarks: "",
    degree: "",
    class: "",
    startYear: "",
    endYear: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const createMutation = trpc.result.create.useMutation({
    onSuccess: () => {
      toast.success("Result uploaded successfully");
      router.push("/dashboard/results");
    },
    onError: (error) => {
      toast.error(error.message);
      setIsProcessing(false);
    },
  });

  const handleFileChange = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.subject ||
      !formData.resultType ||
      !formData.totalMarks ||
      !formData.degree ||
      !formData.class ||
      !formData.startYear ||
      !formData.endYear
    ) {
      toast.error("Please fill all fields");
      return;
    }

    if (!selectedFile) {
      toast.error("Please upload a result file");
      return;
    }

    const totalMarks = parseInt(formData.totalMarks);
    if (isNaN(totalMarks) || totalMarks <= 0) {
      toast.error("Please enter a valid total marks");
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Process file to extract rollNo and marks
      const extractedData = await processResultFile(
        selectedFile,
        (progress) => {
          setProcessingProgress(progress);
        }
      );

      if (extractedData.length === 0) {
        toast.error("No valid data found in file");
        setIsProcessing(false);
        return;
      }

      // Validate marks don't exceed total marks
      const invalidMarks = extractedData.filter(
        (item) => item.marks > totalMarks
      );
      if (invalidMarks.length > 0) {
        toast.error(
          `Some students have marks exceeding total marks (${totalMarks})`
        );
        setIsProcessing(false);
        return;
      }

      // Combine start and end year into session
      const session = `${formData.startYear}-${formData.endYear}`;

      // Prepare student results
      const studentResults = extractedData.map((item) => ({
        rollNo: item.rollNo,
        obtainedMarks: item.marks,
      }));
      console.log(studentResults);
      // Call tRPC mutation
      createMutation.mutate({
        subject: formData.subject as any,
        resultType: formData.resultType as any,
        totalMarks,
        degree: formData.degree,
        class: formData.class,
        session,
        studentResults,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to process file");
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Result</h1>
          <p className="text-muted-foreground">
            Upload student results from a file
          </p>
        </div>
      </div>

      <Card className="">
        <CardHeader>
          <CardTitle>Result Information</CardTitle>
          <CardDescription>
            Enter the details and upload the result file (CSV, Excel, or Image)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select
                  onValueChange={(val) =>
                    setFormData({ ...formData, subject: val })
                  }
                  value={formData.subject}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Result Type</Label>
                <Select
                  onValueChange={(val) =>
                    setFormData({ ...formData, resultType: val })
                  }
                  value={formData.resultType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
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

              <div className="space-y-2">
                <Label htmlFor="totalMarks">Total Marks</Label>
                <Input
                  id="totalMarks"
                  type="number"
                  placeholder="e.g. 100"
                  value={formData.totalMarks}
                  onChange={(e) =>
                    setFormData({ ...formData, totalMarks: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Class</Label>
                <Select
                  onValueChange={(val) =>
                    setFormData({ ...formData, class: val })
                  }
                  value={formData.class}
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
                <Label>Degree</Label>
                <Select
                  onValueChange={(val) =>
                    setFormData({ ...formData, degree: val })
                  }
                  value={formData.degree}
                >
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label>Start Year</Label>
                <Select
                  onValueChange={(val) =>
                    setFormData({ ...formData, startYear: val })
                  }
                  value={formData.startYear}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Start Year" />
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
                  onValueChange={(val) =>
                    setFormData({ ...formData, endYear: val })
                  }
                  value={formData.endYear}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="End Year" />
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

            {/* File Upload */}
            {!isProcessing && (
              <div className="space-y-2">
                <Label>Result File</Label>
                <div className="w-full border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
                  <FileUpload onChange={handleFileChange} />
                </div>
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Upload a CSV, Excel, or image file with columns: rollNo, marks
                </p>
              </div>
            )}

            {/* Processing Status */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span className="text-sm">
                    Processing file... {processingProgress}%
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessing || !selectedFile}>
                {isProcessing ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Result
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
