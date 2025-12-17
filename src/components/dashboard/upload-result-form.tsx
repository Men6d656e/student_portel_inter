
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileUp, X } from "lucide-react"
import { toast } from "sonner"

const degrees = [
    { label: "Medical", value: "Medical" },
    { label: "Non-Medical", value: "Non-Medical" },
    { label: "Computer Science (ICS)", value: "ICS" },
    { label: "Arts (FA)", value: "FA" },
]

const commonSubjects = ["English", "Urdu", "Pak Study", "Tarjumatul Quran"]

const degreeSubjects: Record<string, string[]> = {
    Medical: [...commonSubjects, "Physics", "Chemistry", "Biology"],
    "Non-Medical": [...commonSubjects, "Math", "Physics", "Chemistry"],
    ICS: [...commonSubjects, "Math", "Computer", "Physics", "Statistics", "Economics"],
    FA: [...commonSubjects, "Sociology", "Education", "Isl (Ele)", "H & P Edu", "Economics", "Psychology", "Civics", "Punjabi"] // Added common FA subjects, restricted to user list + robust set if needed, but sticking to user request.
}
// User listed: 1. SOCIOLOGY | Education 2. ISL(ELE) | H & P EDU 3. Economics | Psychology
// I will ensure these are present.

export function UploadResultForm() {
    const [file, setFile] = useState<File | null>(null)
    const [classYear, setClassYear] = useState<string>("")
    const [degree, setDegree] = useState<string>("")
    const [subject, setSubject] = useState<string>("")
    const [totalMarks, setTotalMarks] = useState<string>("")

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0])
        }
    }

    const availableSubjects = degree ? degreeSubjects[degree] || [] : []

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !classYear || !degree || !subject || !totalMarks) {
            toast.error("Please fill in all fields")
            return
        }

        console.log({
            classYear,
            degree,
            subject,
            totalMarks,
            fileName: file.name
        })
        toast.success("Result uploaded (simulated)")
        // Reset or redirect? User said "on submit the form the data was just displayed on the console"
        // And "the add new button... should redirect o the new page...". this IS the new page.
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Upload Result</CardTitle>
                <CardDescription>Select class details and upload the result file.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Class</Label>
                            <Select onValueChange={setClassYear} value={classYear}>
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
                            <Select onValueChange={(val) => { setDegree(val); setSubject(""); }} value={degree}>
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
                            <Label>Subject</Label>
                            <Select onValueChange={setSubject} value={subject} disabled={!degree}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableSubjects.map((s) => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Total Marks</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 100"
                                value={totalMarks}
                                onChange={(e) => setTotalMarks(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Result File</Label>
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer ${file ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept=".csv,.xlsx,.xls,image/*"
                                onChange={handleFileChange}
                            />
                            {file ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-4 bg-primary/10 rounded-full">
                                        <FileUp className="w-8 h-8 text-primary" />
                                    </div>
                                    <p className="font-medium">{file.name}</p>
                                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                                        Remove File
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <div className="p-4 bg-muted rounded-full">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <p className="font-medium">Click to upload or drag and drop</p>
                                    <p className="text-xs">Excel, CSV or Image (Roll No & Marks)</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Button type="submit" className="w-full size-lg text-lg">
                        Submit Result
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
