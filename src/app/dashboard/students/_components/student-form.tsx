"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

const degrees = [
  { label: "Medical", value: "Medical" },
  { label: "Non-Medical", value: "Non-Medical" },
  { label: "Computer Science (ICS)", value: "ICS" },
  { label: "Arts (FA)", value: "FA" },
];

// Generate year options (2020-2031)
const generateYears = () => {
const currentYear = new Date().getFullYear();
  const years = [];
  
  // Start 7 years before current and end 7 years after
  const startBound = currentYear - 7;
  const endBound = currentYear + 7;

  for (let year = startBound; year <= endBound; year++) {
    years.push({ 
      label: year.toString(), 
      value: year.toString() 
    });
  }
  return years;
};

const years = generateYears();

interface StudentFormProps {
  studentId?: string;
  isEditMode?: boolean;
}

export function StudentForm({
  studentId,
  isEditMode = false,
}: StudentFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    class: "",
    degree: "",
    startYear: "",
    endYear: "",
  });

  // Fetch student data if editing
  const { data: student, isLoading: isFetching } =
    trpc.student.getById.useQuery(
      { id: studentId! },
      { enabled: isEditMode && !!studentId }
    );

  // Update form when student data loads
  useEffect(() => {
    if (student) {
      // Use a fallback to prevent splitting undefined
      const rawSession = student.session || "";
      const [start, end] = rawSession.includes("-")
        ? rawSession.split("-")
        : ["", ""];

      console.log(`Setting Form Data for ${student.name}:`, { start, end });

      setFormData({
        name: student.name || "",
        rollNo: student.rollNo || "",
        class: student.class || "",
        degree: student.degree || "",
        startYear: start.trim(), // trim to remove accidental spaces
        endYear: end.trim(),
      });
    }
  }, [student]);

  // Create mutation
  const createMutation = trpc.student.create.useMutation({
    onSuccess: () => {
      toast.success("Student created successfully");
      utils.student.getAll.invalidate();
      utils.student.getStats.invalidate();
      router.push("/dashboard/students");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Update mutation
  const updateMutation = trpc.student.update.useMutation({
    onSuccess: () => {
      toast.success("Student updated successfully");
      utils.student.getAll.invalidate();
      utils.student.getStats.invalidate();
      router.push("/dashboard/students");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  console.log(formData);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.rollNo ||
      !formData.class ||
      !formData.degree ||
      !formData.startYear ||
      !formData.endYear
    ) {
      toast.error("Please fill all fields");
      return;
    }

    // Combine startYear and endYear into session
    const session = `${formData.startYear}-${formData.endYear}`;

    if (isEditMode && studentId) {
      updateMutation.mutate({
        id: studentId,
        name: formData.name,
        rollNo: formData.rollNo,
        class: formData.class,
        degree: formData.degree,
        session,
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        rollNo: formData.rollNo,
        class: formData.class,
        degree: formData.degree,
        session,
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  if (isFetching) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/students">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Loading...</h1>
        </div>
        <Card className="max-w-4xl">
          <CardContent className="pt-6 flex items-center justify-center h-64">
            <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {isEditMode ? "Edit Student" : "Add New Student"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditMode
              ? "Update student information below"
              : "Fill in the details to add a new student"}
          </p>
        </div>
      </div>

      <Card className="">
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>Enter the details of the student.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  className="w-60"
                  id="name"
                  placeholder="e.g. Ali Khan"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rollNo">Roll No</Label>
                <Input
                  className="w-60"
                  id="rollNo"
                  placeholder="e.g. 12345"
                  value={formData.rollNo}
                  onChange={(e) =>
                    setFormData({ ...formData, rollNo: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Class</Label>
                <Select
                key={`class-${formData.class}`}

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
                key={`degree-${formData.degree}`}
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
                  key={`startYear-${formData.startYear}`} // This forces a re-render if the value changes

                  onValueChange={(val) =>
                    setFormData({ ...formData, startYear: val })
                  }
                  value={formData.startYear}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Start Year" />
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
                  key={`endYear-${formData.endYear}`} // This forces a re-render if the value changes
                  onValueChange={(val) =>
                    setFormData((prev) => ({ ...prev, endYear: val }))
                  }
                  value={formData.endYear}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select End Year" />
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

            <div className="flex gap-3 pt-4 ">
              <div className="flex gap-3 sm:flex-row flex-col ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/students")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading && (
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading
                    ? "Saving..."
                    : isEditMode
                    ? "Update Student"
                    : "Create Student"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
