"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff, GraduationCap, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "@/lib/auth-client"

const formSchema = z.object({
  email: z.email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    await signIn.email({
      email: values.email,
      password: values.password,
      fetchOptions: {
        onError: (ctx) => {
          setLoading(false)
          console.log(ctx)
          toast.error(ctx.error.message)
        },
        onSuccess: async () => {
          toast.success("Logged in successfully")
          router.push("/dashboard")
        }
      }
    })
    setLoading(false)
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
          <CardTitle className="text-xl font-bold">Result Management System</CardTitle>
          {/* Welcome Text */}
          <CardDescription className="text-lg font-medium pt-2">Welcome back</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          placeholder="Enter your password"
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
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>

      {/* Tagline Outside Card (Bottom) */}
      <p className="mt-6 text-sm text-muted-foreground text-center">
        Effortless result management system for intermediate students
      </p>
    </div>
  )
}
