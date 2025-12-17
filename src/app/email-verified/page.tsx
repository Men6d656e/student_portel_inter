"use client";

import { authClient } from "@/lib/auth-client";
import { Loader } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            return;
        }

        const verify = async () => {
            await authClient.verifyEmail({
                query: {
                    token: token,
                },
                fetchOptions: {
                    onSuccess: () => {
                        setStatus("success");
                        toast.success("Email verified successfully");
                    },
                    onError: (ctx) => {
                        setStatus("error");
                        toast.error(ctx.error.message);
                    }
                }
            });
        };

        verify();
    }, [token]);

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center gap-4">
                <Loader className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Verifying your email...</p>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
                <div className="rounded-full bg-green-100 p-3 text-green-600">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6"
                    >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                </div>
                <h2 className="text-2xl font-semibold">Email Verified!</h2>
                <p className="text-muted-foreground">
                    Your email has been successfully verified.
                </p>
                <p className="text-muted-foreground">
                    Please use the password sent to your email to log in.
                </p>
                <Button asChild className="mt-4">
                    <Link href="/sign-in">Back to Login</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-red-100 p-3 text-red-600">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m15 9-6 6" />
                    <path d="m9 9 6 6" />
                </svg>
            </div>
            <h2 className="text-2xl font-semibold">Verification Failed</h2>
            <p className="text-muted-foreground">
                Invalid or expired verification token.
            </p>
            <Button variant="outline" asChild className="mt-4">
                <Link href="/sign-in">Back to Login</Link>
            </Button>
        </div>
    );
}

export default function EmailVerifiedPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <h1 className="mb-6 text-2xl font-bold text-center capitalize">
                Government Graduate College Satiana Road Faisalabad
            </h1>
            <Card className="w-full max-w-md">
                <CardHeader className="text-center flex flex-col items-center">
                    <div className="mb-2 p-2 rounded-full bg-primary/10">
                        <GraduationCap className="w-10 h-10 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div className="flex justify-center"><Loader className="animate-spin" /></div>}>
                        <VerifyEmailContent />
                    </Suspense>
                </CardContent>
            </Card>
            <p className="mt-6 text-sm text-muted-foreground text-center">
                Effortless result management system for intermediate students
            </p>
        </div>
    );
}
