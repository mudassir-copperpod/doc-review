import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json(
        { status: "error", message: "No files provided" },
        { status: 400 }
      );
    }

    // Check if we should use mock data
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

    if (useMockData) {
      // Mock response for multiple files
      const mockResults = files.map((file, index) => {
        const fileName = file instanceof File ? file.name : `document-${index}.docx`;
        
        return {
          status: "success",
          run_id: `mock-${Date.now()}-${index}`,
          file_name: fileName,
          output_raw: JSON.stringify({
            meta: {
              document_title: `HOTEL CREW RATE AGREEMENT ${index + 1}`,
              station_or_airport_code: `ABC${index}`,
              hotel_name: `Sample Hotel ${index + 1}`,
              airline_name: `Sample Airline ${index + 1}`,
            },
            review: [
              {
                field: "Name (Parties)",
                actual_content: `Mock content for ${fileName}`,
                compliant: "Y",
                comment: "Mock review comment",
              },
            ],
            snippets: [],
            flags: {
              missing_fields: [],
              ambiguous_points: [],
            },
          }),
          output_parsed: {
            meta: {
              document_title: `HOTEL CREW RATE AGREEMENT ${index + 1}`,
              station_or_airport_code: `ABC${index}`,
              hotel_name: `Sample Hotel ${index + 1}`,
              airline_name: `Sample Airline ${index + 1}`,
            },
            review: [
              {
                field: "Name (Parties)",
                actual_content: `Mock content for ${fileName}`,
                compliant: "Y",
                comment: "Mock review comment",
              },
            ],
            snippets: [],
            flags: {
              missing_fields: [],
              ambiguous_points: [],
            },
          },
        };
      });

      return NextResponse.json({
        status: "success",
        results: mockResults,
      });
    }

    // Real API call
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8000";
    const apiFormData = new FormData();
    
    files.forEach((file) => {
      apiFormData.append("files", file);
    });

    const response = await fetch(`${backendUrl}/analyze-batch`, {
      method: "POST",
      body: apiFormData,
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Batch analyze error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Analysis failed",
      },
      { status: 500 }
    );
  }
}
