
import { StudentForm } from "@/components/dashboard/student-form"

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return <StudentForm studentId={id} isEditMode={true} />
}
