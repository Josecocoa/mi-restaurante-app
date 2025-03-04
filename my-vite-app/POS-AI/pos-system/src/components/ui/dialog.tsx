import React from "react";

interface DialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({ children, open, onOpenChange, className }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className={`bg-white rounded-lg p-6 ${className || ""}`}>
        {children}
      </div>
    </div>
  );
};

interface DialogTriggerProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const DialogTrigger: React.FC<DialogTriggerProps> = ({ children, onClick, className }) => {
  return (
    <button
      className={`${className || ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => {
  return (
    <div className={`${className || ""}`}>
      {children}
    </div>
  );
};

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ children, className }) => {
  return (
    <h2 className={`text-xl font-semibold ${className || ""}`}>
      {children}
    </h2>
  );
};