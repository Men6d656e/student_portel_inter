
import { UploadResultForm } from "@/components/dashboard/upload-result-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewUploadPage() {
    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/uploads">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">Add New Result</h1>
            </div>

            <div className="flex justify-center">
                <UploadResultForm />
            </div>
        </div>
    )
}
