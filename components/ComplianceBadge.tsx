import { Check, X } from "lucide-react";

interface ComplianceBadgeProps {
  status: "Y" | "N";
  size?: "sm" | "md" | "lg";
}

export default function ComplianceBadge({ status, size = "md" }: ComplianceBadgeProps) {
  const isCompliant = status === "Y";
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${
        isCompliant
          ? "bg-green-100 text-green-800 border border-green-300"
          : "bg-red-100 text-red-800 border border-red-300"
      } ${sizeClasses[size]}`}
    >
      {isCompliant ? (
        <Check size={iconSizes[size]} className="flex-shrink-0" />
      ) : (
        <X size={iconSizes[size]} className="flex-shrink-0" />
      )}
      {isCompliant ? "Compliant" : "Non-Compliant"}
    </span>
  );
}
