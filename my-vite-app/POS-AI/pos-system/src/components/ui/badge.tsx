import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "default" | "destructive";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className,
  ...props
}) => {
  const variantClasses = {
    default: "bg-blue-100 text-blue-800",
    destructive: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`px-2 py-1 text-sm rounded-full ${variantClasses[variant]} ${className || ""}`}
      {...props}
    >
      {children}
    </span>
  );
};