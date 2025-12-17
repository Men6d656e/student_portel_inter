import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function AccessDeniedPage() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center bg-background px-4 text-center py-12">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6 animate-in zoom-in duration-500">
                <ShieldAlert className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground max-w-[500px] mb-8 text-lg">
                You do not have permission to access this page. This area is restricted to administrators only.
            </p>
            <div className="flex gap-4">
                <Button asChild variant="default" size="lg">
                    <Link href="/dashboard">Return to Dashboard</Link>
                </Button>
            </div>
        </div>
    );
}
