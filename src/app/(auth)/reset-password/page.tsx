"use client";

import { authClient } from "@/lib/auth-client";
import { Loader, GraduationCap, Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token"); // Note: better-auth might use 'token' or other param. Assuming 'token'.
    // If better-auth uses hash or other method? Usually it sends link with token. Verify param name if needed.

    // Better-auth resetPassword usually takes "token" if we manually extract, or we rely on 'newPassword' + 'token' arg.

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (!token) {
            toast.error("Invalid or missing token");
            return;
        }

        setLoading(true);
        try {
            await authClient.resetPassword({
                newPassword: password,
                token,
                fetchOptions: {
                    onSuccess: () => {
                        toast.success("Password reset successfully!");
                        router.push("/sign-in");
                    },
                    onError: (ctx) => {
                        toast.error(ctx.error.message || "Failed to reset password");
                    }
                }
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center p-4">
                <p className="text-red-500">Invalid or missing reset token.</p>
                <Button variant="link" asChild className="mt-2">
                    <Link href="/forgot-password">Request meaningful link</Link>
                </Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="New password"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">Toggle password visibility</span>
                    </Button>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Confirm new password"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">Toggle password visibility</span>
                    </Button>
                </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
            </Button>
        </form>
    );
}

export default function ResetPasswordPage() {
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
                    <CardTitle className="text-xl font-bold">Reset Password</CardTitle>
                    <CardDescription>
                        Enter your new password below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div className="flex justify-center"><Loader className="animate-spin" /></div>}>
                        <ResetPasswordContent />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
