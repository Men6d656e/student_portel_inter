"use client";

import { TeacherForm } from "../_components/teacher-form";
import { trpc } from "@/lib/trpc";
import { Loader } from "lucide-react";
import { useParams } from "next/navigation";

export default function EditTeacherPage() {
    const params = useParams();
    const id = params?.id as string;

    // We need a specific query to fetch one teacher.
    // However, I didn't create `getOne` in the router.
    // I can reuse getAll with a filter? No, inefficient.
    // I should add `getById` to the router OR just iterate find on client (bad).
    // Let's add `getById` to the router quickly or use getAll filtering temporarily/mock.
    // Actually, creating `getById` is the right way.
    // But since I can't edit router in this turn easily without multi-file logic, 
    // I will use `getAll` search temporarily or assume `getById` exists and I'll add it in next turn.
    // Wait, I can try to use `getAll` with search=ID if email/name match? No.
    // I will add `getById` to the router in the next turn. For now, I'll placeholder the fetch.

    // Let's assume `getById` is available. I will add it.
    const { data: teacher, isLoading } = trpc.teacher.getById.useQuery({ id }, {
        enabled: !!id
    });

    if (isLoading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center text-muted-foreground">
                Teacher not found.
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Edit Teacher</h2>
                <p className="text-muted-foreground">
                    Update teacher information.
                </p>
            </div>
            <TeacherForm initialData={teacher} />
        </div>
    );
}
