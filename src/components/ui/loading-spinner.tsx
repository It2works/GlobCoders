import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner = ({ size = "md", className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
  );
};

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingState = ({ 
  message = "Loading...", 
  size = "md", 
  className 
}: LoadingStateProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 space-y-4", className)}>
      <LoadingSpinner size={size} />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
};