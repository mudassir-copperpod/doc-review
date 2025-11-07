"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import DocumentPreview from "@/components/DocumentPreview";
import ReviewInterface from "@/components/ReviewInterface";
import { OutputParsed, ApiResponse } from "@/lib/types";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [reviewData, setReviewData] = useState<OutputParsed | null>(null);
  const [fileName, setFileName] = useState("");
  const [fullApiResponse, setFullApiResponse] = useState<ApiResponse["output_parsed"] | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [highlightText, setHighlightText] = useState<string>("");

  const handleUploadSuccess = ({
    parsed,
    fileName: name,
    file: uploadedFile,
  }: {
    parsed: OutputParsed;
    fileName: string;
    file: File;
  }) => {
    setReviewData(parsed);
    setFileName(name);
    setFile(uploadedFile);
    setFullApiResponse(parsed);
    setIsApproved(false); // Reset approval status on new upload
    setHighlightText(""); // Clear any highlights
  };

  const handleHighlightRequest = (text: string) => {
    setHighlightText(text);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm px-6 py-3.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <FileUpload 
            onUploadSuccess={handleUploadSuccess}
            apiResponse={fullApiResponse}
            isApproved={isApproved}
          />
          {fileName && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              <span className="text-base">📄</span>
              <span className="max-w-md truncate font-medium">{fileName}</span>
            </div>
          )}
        </div>
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
          Hotel Agreement Review System
        </h1>
      </header>

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Document Preview */}
        <div className="w-1/2 border-r border-gray-200">
          <DocumentPreview file={file} highlightText={highlightText} />
        </div>

        {/* Right Panel - Review Interface */}
        <div className="w-1/2">
          <ReviewInterface 
            data={reviewData}
            onApprove={() => setIsApproved(true)}
            onReject={() => setIsApproved(false)}
            isApproved={isApproved}
            onHighlightRequest={handleHighlightRequest}
          />
        </div>
      </div>
    </div>
  );
}
