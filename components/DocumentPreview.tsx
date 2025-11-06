"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, Loader2, ZoomIn, ZoomOut } from "lucide-react";
import mammoth from "mammoth";

interface DocumentPreviewProps {
  file: File | null;
  highlightText?: string | null;
}

export default function DocumentPreview({ file, highlightText }: DocumentPreviewProps) {
  const [htmlContent, setHtmlContent] = useState("");
  const [zoom, setZoom] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const convertDocument = async () => {
      if (!file) {
        setHtmlContent("");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setHtmlContent(result.value);
      } catch (err) {
        console.error("Failed to convert document:", err);
        setError("Failed to load document. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    convertDocument();
  }, [file]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(200, prev + 25));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(50, prev - 25));
  };

  // Handle text highlighting and scrolling
  useEffect(() => {
    if (!highlightText || !contentRef.current) return;

    const container = contentRef.current;
    
    // Remove existing highlights
    const existingHighlights = container.querySelectorAll('.auto-highlight');
    existingHighlights.forEach(el => {
      const parent = el.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent || ''), el);
        parent.normalize();
      }
    });

    // Find and highlight the text
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null
    );

    const nodesToHighlight: { node: Text; index: number; length: number }[] = [];
    const searchText = highlightText.toLowerCase();
    
    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      const text = node.textContent?.toLowerCase() || '';
      const index = text.indexOf(searchText);
      
      if (index !== -1) {
        nodesToHighlight.push({
          node,
          index,
          length: highlightText.length
        });
      }
    }

    // Apply highlights
    nodesToHighlight.forEach(({ node, index, length }) => {
      const text = node.textContent || '';
      const before = text.substring(0, index);
      const match = text.substring(index, index + length);
      const after = text.substring(index + length);

      const fragment = document.createDocumentFragment();
      
      if (before) fragment.appendChild(document.createTextNode(before));
      
      const mark = document.createElement('mark');
      mark.className = 'auto-highlight bg-yellow-300 px-1 rounded transition-all duration-300 ring-2 ring-yellow-400';
      mark.textContent = match;
      fragment.appendChild(mark);
      
      if (after) fragment.appendChild(document.createTextNode(after));

      node.parentNode?.replaceChild(fragment, node);
    });

    // Scroll to first highlight
    if (nodesToHighlight.length > 0) {
      const firstHighlight = container.querySelector('.auto-highlight');
      if (firstHighlight) {
        firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightText]);

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center text-gray-400">
          <FileText className="w-16 h-16 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-lg font-medium">No Document Uploaded</p>
          <p className="text-sm mt-2">Upload a .docx file to preview</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-gray-600">Converting document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center text-red-600">
          <p className="text-lg font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Zoom Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
        <h3 className="text-sm font-medium text-gray-700">Document Preview</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[50px] text-center">
            {zoom}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-auto p-6">
        <div
          className="mx-auto bg-white shadow-lg transition-all duration-200"
          style={{
            width: `${zoom}%`,
            maxWidth: "850px",
            minWidth: "400px",
          }}
        >
          <div
            ref={contentRef}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            className="prose prose-sm max-w-none p-8 
              prose-headings:text-gray-900 prose-headings:font-bold
              prose-p:text-gray-900 prose-p:leading-relaxed
              prose-strong:text-gray-900 prose-strong:font-bold
              prose-ul:list-disc prose-ol:list-decimal
              prose-li:text-gray-900
              **:text-gray-900"
          />
        </div>
      </div>
    </div>
  );
}
