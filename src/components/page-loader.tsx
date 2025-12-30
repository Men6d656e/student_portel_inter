"use client";

import { Loader } from "lucide-react";

export function PageLoader() {
    return (
        <div className="flex h-[300px] w-full items-center justify-center animate-in fade-in duration-500">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <Loader className="h-6 w-6 absolute top-3 left-3 animate-pulse text-primary" />
                </div>
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading content...</p>
            </div>
        </div>
    );
}
