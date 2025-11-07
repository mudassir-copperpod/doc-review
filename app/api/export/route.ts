import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if we should use mock data (for POC)
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

    if (useMockData) {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Return mock success response
      // In a real scenario, this would return a PDF/Excel file blob
      return new NextResponse(
        JSON.stringify({ message: "Mock export successful" }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
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

    // Fallback to mock data in development
    if (process.env.NODE_ENV === "development") {
      return new NextResponse(
        JSON.stringify({ message: "Mock export (fallback)" }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return NextResponse.json(
      { error: "Failed to export report" },
      { status: 500 }
    );
  }
}
