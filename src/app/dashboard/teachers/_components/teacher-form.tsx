"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChevronLeft, Upload, X, Loader } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const teacherSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
});

interface TeacherFormProps {
    initialData?: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
        _count?: {
            uploadedResults: number;
        };
    };
}

export function TeacherForm({ initialData }: TeacherFormProps) {
    const router = useRouter();
    const isEditing = !!initialData;

    const form = useForm<z.infer<typeof teacherSchema>>({
        resolver: zodResolver(teacherSchema),
        defaultValues: {
            name: initialData?.name || "",
            email: initialData?.email || "",
        },
    });

    const createMutation = trpc.teacher.create.useMutation({
        onSuccess: () => {
            toast.success("Teacher created successfully");
            router.push("/dashboard/teachers");
            router.refresh();
        },
        onError: (err) => {
            toast.error(`Error creating teacher: ${err.message}`);
        },
    });

    const updateMutation = trpc.teacher.update.useMutation({
        onSuccess: () => {
            toast.success("Teacher updated successfully");
            router.push("/dashboard/teachers");
            router.refresh();
        },
        onError: (err) => {
            toast.error(`Error updating teacher: ${err.message}`);
        },
    });

    const onSubmit = (values: z.infer<typeof teacherSchema>) => {
        if (isEditing && initialData) {
            updateMutation.mutate({
                id: initialData.id,
                name: values.name,
            });
        } else {
            // Generate 8-char random password
            const password = Math.random().toString(36).slice(-8);
            createMutation.mutate({
                ...values,
                password,
            });
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="flex flex-col gap-6">
            {isEditing && initialData && (
                <Card>
                    <CardHeader>
                        <CardTitle>Teacher Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={initialData.image || ""} />
                            <AvatarFallback className="text-2xl">{initialData.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <div className="text-2xl font-bold">{initialData.name}</div>
                            <div className="text-muted-foreground">{initialData.email}</div>
                            <div className="text-sm font-medium bg-secondary px-3 py-1 rounded-full w-fit mt-2">
                                Uploads: {initialData._count?.uploadedResults || 0}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>{isEditing ? "Update Details" : "New Teacher Details"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="john@example.com"
                                                {...field}
                                                disabled={isEditing}
                                                className={isEditing ? "bg-muted text-muted-foreground" : ""}
                                            />
                                        </FormControl>
                                        {isEditing && <p className="text-xs text-muted-foreground">Email cannot be changed directly.</p>}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4 sm:flex-row flex-col">
                                <Button type="button" variant="outline" onClick={() => router.back()}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                                    {isEditing ? "Save Changes" : "Create Teacher"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
