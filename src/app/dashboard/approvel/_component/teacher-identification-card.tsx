"use client";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Loader, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const TeacherIdentityVerificationCard = () => {
  const utils = trpc.useUtils();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: teachersNeedAprovel, isLoading } =
    trpc.teacher.getTeachersNeedAprovel.useQuery();

  const deleteMutation = trpc.teacher.delete.useMutation({
    onSuccess: () => {
      toast.success("Teacher deleted successfully");
      setDeleteId(null);
      utils.teacher.getTeachersNeedAprovel.invalidate();
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
        utils.teacher.getTeachersNeedAprovel.invalidate();
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

  return (
    <>
      {teachersNeedAprovel && teachersNeedAprovel.length > 0 && (
        <div className="flex gap-4 border border-yellow-900/50 bg-yellow-900/10 p-4 rounded-md mb-8">
          <TriangleAlert className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-yellow-500">
              Verification Action Required
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Please review and approve the pending teacher registrations.
              Verify their identity carefully; if they do not belong to your
              institution, reject the application.
              <strong className="block mt-1 text-red-400/80 font-normal">
                Note: Rejecting a teacher will permanently delete their record
                from the database.
              </strong>
            </p>
          </div>
        </div>
      )}
      {isLoading && (
        <div className="flex justify-center items-center">
          <Loader className="animate-spin mx-auto" />{" "}
        </div>
      )}
      <div className="grid md:grid-cols-3 grid-cols-1 gap-5">
        {teachersNeedAprovel && teachersNeedAprovel.length > 0
          ? teachersNeedAprovel.map((teacher, index) => (
              <div key={index} className="border p-4 mb-4 rounded-lg shadow-sm">
                <Avatar>
                  <AvatarImage src=".." />
                  <AvatarFallback>
                    {teacher && teacher.name && teacher.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold mb-2 capitalize">
                  {teacher.name}
                </h3>
                <p className="text-xs text-primary">{teacher.email}</p>
                <p className="text-xs mt-1">
                  {new Date(teacher.createdAt).toLocaleDateString()}
                </p>
                <div className="mt-4 gap-2 flex">
                  <Button
                    size={"sm"}
                    onClick={() => handleApprovedTeacher(teacher.id)}
                  >
                    Approved
                  </Button>
                  <Button
                    variant={"destructive"}
                    size={"sm"}
                    onClick={() => setDeleteId(teacher.id)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))
          : !isLoading && (
              <p className="text-center col-span-3">
                No teachers pending approval.
              </p>
            )}
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
              teacher account.
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
    </>
  );
};

export default TeacherIdentityVerificationCard;
