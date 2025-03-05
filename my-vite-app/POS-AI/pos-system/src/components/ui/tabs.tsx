import React from "react";

interface TabsProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (value: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ children, activeTab, setActiveTab, className }) => {
  return (
    <div className={`${className || ""}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, { activeTab, setActiveTab });

        }
        return child;
      })}
    </div>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  return <div className={`flex space-x-2 ${className || ""}`}>{children}</div>;
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (value: string) => void;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  activeTab,
  setActiveTab,
  className,
}) => {
  return (
    <button
      className={`px-4 py-2 rounded-md ${
        activeTab === value ? "bg-blue-500 text-white" : "bg-gray-100"
      } ${className || ""}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  activeTab: string;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, activeTab, className }) => {
  return activeTab === value ? <div className={`mt-4 ${className || ""}`}>{children}</div> : null;
};
