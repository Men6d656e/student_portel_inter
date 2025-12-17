
"use client"

import { useSession } from "@/lib/auth-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { Loader } from "lucide-react"

export default function ProfilePage() {
    const { data: session, isPending } = useSession()
    const [name, setName] = useState(session?.user?.name || "")
    const [isUpdating, setIsUpdating] = useState(false)

    // Sync name when session loads
    if (session?.user?.name && name === "") {
        setName(session.user.name)
    }

    const handleUpdate = async () => {
        setIsUpdating(true)
        try {
            await authClient.updateUser({
                name: name
            })
            toast.success("Profile updated successfully")
        } catch (error) {
            toast.error("Failed to update profile")
        } finally {
            setIsUpdating(false)
        }
    }

    if (isPending) {
        return <div className="flex h-full items-center justify-center"><Loader className="animate-spin" /></div>
    }

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold">Profile</h1>

            {/* Profile Details Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                    <CardDescription>Manage your profile information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={session?.user?.image || ""} />
                            <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-lg">{session?.user?.name}</p>
                            <p className="text-muted-foreground">{session?.user?.email}</p>
                            <p className="text-sm text-muted-foreground capitalize">Role: {(session?.user as any)?.role}</p>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={session?.user?.email || ""} disabled />
                        <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Username</Label>
                        <div className="flex gap-2">
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <Button onClick={handleUpdate} disabled={isUpdating}>
                                {isUpdating && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                                Update
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Upload Stats Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Upload Statistics</CardTitle>
                    <CardDescription>Overview of your uploaded results.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                            <p className="text-sm font-medium text-muted-foreground">Total Uploads</p>
                            <h2 className="text-2xl font-bold">0</h2>
                            {/* Placeholder: Needs to fetch from API */}
                        </div>
                        {/* Add more stats if needed */}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
