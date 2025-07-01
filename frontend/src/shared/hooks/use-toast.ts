
// Compatibility shim: Redirect old toast usage to Sonner
import { toast as sonnerToast } from "@/components/ui/sonner";

// Convert old toast API format to Sonner format
export function useToast() {
  return {
    toast: (props: {
      title?: string;
      description?: string;
      variant?: "default" | "destructive" | "success";
    }) => {
      const { title, description, variant = "default" } = props;
      
      if (variant === "destructive") {
        return sonnerToast.error(title || "Error", {
          description,
        });
      } else if (variant === "success") {
        return sonnerToast.success(title || "Success", {
          description,
        });
      } else {
        return sonnerToast(title || "Notification", {
          description,
        });
      }
    }
  };
}

// Export the toast function directly for convenience
export const toast = (props: {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
}) => {
  const { toast: toastFn } = useToast();
  return toastFn(props);
};
