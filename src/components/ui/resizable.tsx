import * as React from "react";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

// Placeholder component - react-resizable-panels has API compatibility issues
const ResizablePanelGroup = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn("flex h-full w-full", className)}
    {...props}
  >
    {children}
  </div>
);

const ResizablePanel = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => (
  <div className={cn("flex-1", className)} {...props}>
    {children}
  </div>
);

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<"div"> & { withHandle?: boolean }) => (
  <div
    className={cn(
      "relative flex w-px items-center justify-center bg-border",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </div>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
