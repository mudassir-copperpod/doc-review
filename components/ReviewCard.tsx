"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import ComplianceBadge from "./ComplianceBadge";
import { ReviewField, Snippet } from "@/lib/types";
import { highlightText } from "@/lib/utils";

interface ReviewCardProps {
  field: ReviewField;
  snippet?: Snippet;
  searchTerm: string;
  isExpanded: boolean;
  onToggle: () => void;
  onHighlightRequest?: (text: string | null) => void;
}

export default function ReviewCard({ field, snippet, searchTerm, isExpanded, onToggle, onHighlightRequest }: ReviewCardProps) {
  const isCompliant = field.compliant === "Y";
  const borderColor = isCompliant ? "border-green-200" : "border-red-200";
  const bgColor = isCompliant ? "bg-green-50/30" : "bg-red-50/30";

  const renderHighlightedText = (text: string) => {
    const parts = highlightText(text, searchTerm);
    return parts.map((part, index) => (
      part.highlight ? (
        <mark key={index} className="bg-yellow-200 font-semibold px-0.5">
          {part.text}
        </mark>
      ) : (
        <span key={index}>{part.text}</span>
      )
    ));
  };

  return (
    <div className={`border-2 ${borderColor} ${bgColor} rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg shadow-sm`}>
      {/* Collapsed Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-start gap-3 text-left hover:bg-white/70 transition-all duration-150"
      >
        <div className="flex-shrink-0 mt-1">
          {isExpanded ? (
            <ChevronDown size={20} className="text-gray-600" />
          ) : (
            <ChevronRight size={20} className="text-gray-600" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1">{field.field}</h3>
          <p className={`text-sm text-gray-600 ${!isExpanded ? "line-clamp-2" : ""}`}>
            {renderHighlightedText(field.comment)}
          </p>
        </div>

        <div className="flex-shrink-0">
          <ComplianceBadge status={field.compliant} size="sm" />
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t-2 border-gray-200 bg-gradient-to-b from-white to-gray-50 p-6 space-y-5">
          {/* Review Comment */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
              Review Comment
            </h4>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 text-sm text-gray-800 leading-relaxed shadow-sm">
              {renderHighlightedText(field.comment)}
            </div>
          </div>

          {/* Extracted Content */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-gray-500 rounded-full"></span>
              Extracted Content
              {field.actual_content && onHighlightRequest && (
                <button
                  onClick={() => onHighlightRequest(snippet?.text || field.actual_content)}
                  className="ml-auto text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors font-medium flex items-center gap-1"
                  title="Highlight in document"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Show in Doc
                </button>
              )}
            </h4>
            <div 
              className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-800 leading-relaxed shadow-sm cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => field.actual_content && onHighlightRequest?.(snippet?.text || field.actual_content)}
              title="Click to highlight in document"
            >
              {field.actual_content ? (
                renderHighlightedText(field.actual_content)
              ) : (
                <span className="text-gray-400 italic">No content extracted</span>
              )}
            </div>
          </div>

          {/* Full Document Section */}
          {snippet && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                Full Document Section
              </h4>
              <div className="border-2 border-gray-300 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-3 border-b border-gray-300">
                  <div className="font-semibold text-gray-900">{snippet.label}</div>
                  <div className="text-xs text-gray-600 mt-1 font-medium">{snippet.page_or_section}</div>
                </div>
                <div className="bg-white p-4 text-sm text-gray-800 leading-relaxed">
                  {renderHighlightedText(snippet.text)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
