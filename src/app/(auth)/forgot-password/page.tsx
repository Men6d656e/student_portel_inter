"use client";

import { authClient } from "@/lib/auth-client";
import { Loader, GraduationCap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authClient.requestPasswordReset({
                email,
                redirectTo: "/reset-password",
            });

            setSubmitted(true);
            toast.success("Password reset email sent!");
        } catch (error: any) {
            console.error("Forgot Password Error:", error);
            toast.error(error.message || "Failed to send reset email");
        } finally {
            setLoading(false);
        }
    };

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
                    <CardTitle className="text-xl font-bold">Forgot Password?</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email address to receive a password reset link.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                                Send Reset Link
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="rounded-full bg-green-100 p-3 text-green-600 inline-block">
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
                            <p className="text-muted-foreground">
                                We have sent a password reset link to <strong>{email}</strong>.
                                Please check your inbox.
                            </p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button variant="link" asChild>
                        <Link href="/sign-in">Back to Sign In</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
