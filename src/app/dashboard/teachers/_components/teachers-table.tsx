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
import {
  Loader,
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  BadgeAlert,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function TeachersTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "VERIFIED" | "UNVERIFIED">(
    "ALL"
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, refetch } = trpc.teacher.getAll.useQuery(
    {
      page,
      limit: 10,
      search,
      filter,
    },
    {
      // @ts-ignore - keepPreviousData might be deprecated in newer tanstack query but useful if available or simple refetch
      keepPreviousData: true,
    }
  );

  console.log(data);

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

  const ApprovedTeacherIdentity =
    trpc.teacher.approvedTeacherIdentity.useMutation({
      onSuccess: () => {
        toast.success("Teacher identity approved successfully");
        refetch();
      },
      onError: (err) => {
        toast.error(`Error in Approving teacher: ${err.message}`);
      },
    });

  const handleApprovedTeacher = (id: string) => {
    if (id) {
      ApprovedTeacherIdentity.mutate({ id: id });
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if ((isLoading && !data) || isRefreshing) {
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
    <div className="space-y-4 px-6">
      <div className="flex items-center justify-between">
        <Tabs
          defaultValue="ALL"
          onValueChange={handleTabChange}
          className="w-[400px]"
        >
          <TabsList>
            <TabsTrigger value="ALL">All Accounts</TabsTrigger>
            <TabsTrigger value="VERIFIED">Verified</TabsTrigger>
            <TabsTrigger value="UNVERIFIED">Unverified</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teachers..."
              className="pl-8"
              value={search}
              onChange={handleSearch}
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading || isRefreshing}>
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher</TableHead>
              <TableHead>Email Verified</TableHead>
              <TableHead>Identity Verified</TableHead>
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
                      <AvatarFallback>
                        {teacher.name?.substring(0, 2).toUpperCase() || "T"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{teacher.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {teacher.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {teacher.emailVerified ? (
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                        Unverified
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {teacher.isApproved ? (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 flex w-fit items-center gap-1">
                        <CircleCheck className="h-3 w-3" /> Approved
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20 flex w-fit items-center gap-1">
                        <BadgeAlert className="h-3 w-3" /> Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{teacher._count.uploadedResults}</span>
                      <span className="text-xs text-muted-foreground italic">uploads</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {
                        !teacher.isApproved && (
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-500/20"
                            onClick={() => handleApprovedTeacher(teacher.id)}
                          >
                            <CircleCheck className="mr-1 h-3 w-3" />
                            Approve
                          </Button>
                        )
                      }
                      <Button variant="outline" size="sm" asChild className="hover:bg-primary/5 hover:text-primary border-primary/10">
                        <Link href={`/dashboard/teachers/${teacher.id}`}>
                          <Pencil className="mr-1 h-3 w-3" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteId(teacher.id)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
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

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              teacher account and all{" "}
              {data?.teachers.find((t: any) => t.id === deleteId)?._count
                .uploadedResults || 0}{" "}
              uploaded results associated with them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
