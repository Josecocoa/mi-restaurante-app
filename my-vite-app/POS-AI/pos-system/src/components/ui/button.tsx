import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost" | "destructive";
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "default",
  className,
  ...props
}) => {
  const variantClasses = {
    default: "bg-blue-500 text-white hover:bg-blue-600",
    outline: "border border-gray-300 hover:bg-gray-100",
    ghost: "bg-transparent hover:bg-gray-100",
    destructive: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button
      className={`px-4 py-2 rounded-md ${variantClasses[variant]} ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  );
};