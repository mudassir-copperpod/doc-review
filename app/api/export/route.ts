import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { FileData } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if we should use mock data (for POC)
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

    if (useMockData) {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Generate a proper Excel file from the approved files data
      const approvedFiles = body.additionalProp1 || [];
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      
      // Create a summary sheet
      const summaryData = [
        ["Compliance Report"],
        ["Generated:", new Date().toLocaleString()],
        ["Total Files:", approvedFiles.length],
        [],
        ["File Name", "Hotel Name", "Airline Name", "Airport Code", "Compliant Items", "Non-Compliant Items", "Total Items", "Compliance %"],
      ];
      
      approvedFiles.forEach((fileData: FileData) => {
        const meta = fileData.parsed.meta;
        const review = fileData.parsed.review;
        const compliant = review.filter((item) => item.compliant === "Y").length;
        const nonCompliant = review.filter((item) => item.compliant === "N").length;
        const total = review.length;
        const percentage = total > 0 ? ((compliant / total) * 100).toFixed(1) : "0";
        
        summaryData.push([
          fileData.fileName,
          meta.hotel_name,
          meta.airline_name,
          meta.station_or_airport_code,
          compliant,
          nonCompliant,
          total,
          `${percentage}%`
        ]);
      });
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
      
      // Create detailed sheets for each file
      approvedFiles.forEach((fileData: FileData, index: number) => {
        const meta = fileData.parsed.meta;
        const review = fileData.parsed.review;
        
        const detailData = [
          ["Document:", meta.document_title],
          ["Hotel:", meta.hotel_name],
          ["Airline:", meta.airline_name],
          ["Airport Code:", meta.station_or_airport_code],
          [],
          ["Field", "Actual Content", "Compliant", "Comment"],
        ];
        
        review.forEach((item) => {
          detailData.push([
            item.field,
            item.actual_content,
            item.compliant,
            item.comment
          ]);
        });
        
        const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
        const sheetName = `File ${index + 1}`;
        XLSX.utils.book_append_sheet(workbook, detailSheet, sheetName);
      });
      
      // Generate Excel file buffer
      const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      
      return new NextResponse(excelBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="compliance-report-${Date.now()}.xlsx"`,
        },
      });
    }

    // TODO: Replace with actual backend URL when ready
    const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8000";

    const response = await fetch(`${BACKEND_URL}/export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    // Forward the file blob from backend
    const blob = await response.blob();
    const contentType = response.headers.get("content-type") || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const contentDisposition = response.headers.get("content-disposition") || 
      `attachment; filename="compliance-report-${Date.now()}.xlsx"`;

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
      },
    });
  } catch (error) {
    console.error("Export error:", error);

    // Fallback to a simple Excel file in development
    if (process.env.NODE_ENV === "development") {
      const workbook = XLSX.utils.book_new();
      const errorData = [
        ["Export Error"],
        ["An error occurred while generating the report."],
        ["Please check the console for details."],
        [],
        ["Error:", String(error)]
      ];
      const errorSheet = XLSX.utils.aoa_to_sheet(errorData);
      XLSX.utils.book_append_sheet(workbook, errorSheet, "Error");
      
      const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      
      return new NextResponse(excelBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="error-report-${Date.now()}.xlsx"`,
        },
      });
    }

    return NextResponse.json(
      { error: "Failed to export report" },
      { status: 500 }
    );
  }
}
