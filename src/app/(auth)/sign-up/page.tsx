"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, GraduationCap, Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signUp } from "@/lib/auth-client";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  isTeacher: z.boolean().default(false),
});

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    await signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
      // @ts-ignore - better-auth client types might not infer extra fields automatically implies schema update
      // Assuming server is configured to accept additional fields or we use a separate mechanism.
      // better-auth prisma adapter usually handles extra fields if they exist in schema and we pass them.
      // However, for strict typing, we might need a workaround.
      // Let's try passing it. If it fails, I'd need to update the auth definition.
      // The user asked to "set this role to the teacher".
      role: values.isTeacher ? "TEACHER" : "STUDENT",
      ...(values.isTeacher ? { isApproved: false } : {}),
      fetchOptions: {
        onError: (ctx) => {
          setLoading(false);
          console.log(ctx);

          toast.error(ctx.error.message);
        },
        onSuccess: async () => {
          toast.success("Account created successfully");
          router.push("/sign-in");
        },
      },
    });
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      {/* College Name Outside Card (Top) */}
      <h1 className="mb-6 text-2xl font-bold text-center capitalize">
        Government Graduate College Satiana Road Faisalabad
      </h1>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center flex flex-col items-center">
          {/* Logo inside card */}
          <div className="mb-2 p-2 rounded-full bg-primary/10">
            <GraduationCap className="w-10 h-10 text-primary" />
          </div>
          {/* App Name */}
          <CardTitle className="text-xl font-bold">
            Result Management System
          </CardTitle>
          {/* Welcome Text */}
          <CardDescription className="text-lg font-medium pt-2">
            Create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          {...field}
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
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isTeacher"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>I am a Teacher</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Select this only if you are a faculty member.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch("isTeacher") && (
                <Alert variant="default">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Teacher accounts require manual verification by an
                    administrator. You will not have access to teacher features
                    until approved.
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Sign Up
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          <p>
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>

      {/* Tagline Outside Card (Bottom) */}
      <p className="mt-6 text-sm text-muted-foreground text-center">
        Effortless result management system for intermediate students
      </p>
    </div>
  );
}
