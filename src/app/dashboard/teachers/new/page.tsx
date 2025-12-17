import { TeacherForm } from "../_components/teacher-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Add New Teacher",
    description: "Create a new teacher account.",
};

export default function NewTeacherPage() {
    return (
        <div className="flex flex-1 flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Add Teacher</h2>
                <p className="text-muted-foreground">
                    Create a new teacher account. They will receive an email verification.
                </p>
            </div>
            <TeacherForm />
        </div>
    );
}
