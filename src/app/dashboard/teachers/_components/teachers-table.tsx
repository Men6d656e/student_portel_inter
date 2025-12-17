"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader, MoreHorizontal, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export function TeachersTable() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"ALL" | "VERIFIED" | "UNVERIFIED">("ALL");
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const { data, isLoading, refetch } = trpc.teacher.getAll.useQuery({
        page,
        limit: 10,
        search,
        filter,
    }, {
        // @ts-ignore - keepPreviousData might be deprecated in newer tanstack query but useful if available or simple refetch
        keepPreviousData: true,
    });

    const deleteMutation = trpc.teacher.delete.useMutation({
        onSuccess: () => {
            toast.success("Teacher deleted successfully");
            setDeleteId(null);
            refetch();
        },
        onError: (err) => {
            toast.error(`Error deleting teacher: ${err.message}`);
        },
    });

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate({ id: deleteId });
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1); // Reset to page 1 on search
    };

    const handleTabChange = (val: string) => {
        setFilter(val as any);
        setPage(1);
    };

    if (isLoading && !data) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Tabs defaultValue="ALL" className="w-[400px]">
                        <TabsList>
                            <TabsTrigger value="ALL">All Accounts</TabsTrigger>
                            <TabsTrigger value="VERIFIED">Verified</TabsTrigger>
                            <TabsTrigger value="UNVERIFIED">Unverified</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search teachers..."
                            className="pl-8"
                            value={search}
                            disabled
                        />
                    </div>
                </div>

                <div className="rounded-md border h-[500px] flex items-center justify-center">
                    <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Tabs defaultValue="ALL" onValueChange={handleTabChange} className="w-[400px]">
                    <TabsList>
                        <TabsTrigger value="ALL">All Accounts</TabsTrigger>
                        <TabsTrigger value="VERIFIED">Verified</TabsTrigger>
                        <TabsTrigger value="UNVERIFIED">Unverified</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search teachers..."
                        className="pl-8"
                        value={search}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Teacher</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Results Uploaded</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.teachers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No teachers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.teachers.map((teacher: any) => (
                                <TableRow key={teacher.id}>
                                    <TableCell className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={teacher.image || ""} />
                                            <AvatarFallback>{teacher.name?.substring(0, 2).toUpperCase() || "T"}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{teacher.name}</span>
                                            <span className="text-xs text-muted-foreground">{teacher.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {teacher.emailVerified ? (
                                            <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-50 px-2 py-0.5 text-xs font-semibold text-yellow-700">
                                                Unverified
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>{teacher._count.uploadedResults}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/dashboard/teachers/${teacher.id}`}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => setDeleteId(teacher.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isLoading}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                    Page {page} of {data?.totalPages || 1}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= (data?.totalPages || 1) || isLoading}
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the teacher account
                            and all {data?.teachers.find((t: any) => t.id === deleteId)?._count.uploadedResults || 0} uploaded results associated with them.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
