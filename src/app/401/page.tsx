import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Metadata } from "next";
import { ArrowLeft, ShieldOff } from "lucide-react";

export const metadata: Metadata = {
  title: "Unauthorized — AffProf",
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="flex max-w-lg flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 dark:bg-amber-500/20">
          <ShieldOff className="h-8 w-8 text-amber-500" />
        </div>

        {/* Big 401 */}
        <span className="mb-2 text-[8rem] font-black leading-none tracking-tighter text-foreground/10 dark:text-foreground/15">
          401
        </span>

        {/* Text */}
        <h1 className="mb-2 text-2xl font-bold tracking-tight">Unauthorized</h1>
        <p className="mb-8 max-w-sm text-muted-foreground">
          Your session may have expired or you don&apos;t have access to this
          page. Please log in again.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back home
          </Link>
          <Link
            href="/"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
