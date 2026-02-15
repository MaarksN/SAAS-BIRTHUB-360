import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none ring-offset-background";

    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
      outline: "border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} h-10 py-2 px-4 ${className || ""}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
