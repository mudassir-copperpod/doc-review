# Hotel Agreement Review System - POC Implementation Plan

## Overview

This document outlines the implementation plan for the POC (Proof of Concept) focusing **exclusively on UI and frontend functionality**. The backend API will be provided by the backend team, so this implementation focuses on creating a responsive, interactive interface for document review.

---

## Scope

### ✅ In Scope (POC)
- File upload interface
- Document preview (DOCX to HTML conversion)
- Split-view layout (50-50)
- Review interface with expandable cards
- Search and filter functionality
- Responsive design
- Mock data integration for testing
- API integration layer (ready for backend)

### ❌ Out of Scope (POC)
- Backend API implementation
- AI/ML document analysis
- Export functionality (PDF/Excel)
- User authentication
- Database integration
- Batch processing
- Collaboration features

---

## Tech Stack

### Frontend Framework
- **Next.js 14+** (App Router)
- **React 18+**
- **TypeScript**

### UI Libraries
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Mammoth.js** - DOCX to HTML conversion

### State Management
- React hooks (useState, useContext, useMemo)

---

## Project Structure

```
doc-review/
├── app/
│   ├── page.tsx                    # Main page with split view
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   └── api/
│       └── analyze/
│           └── route.ts            # API proxy (ready for backend)
├── components/
│   ├── FileUpload.tsx              # Upload button & validation
│   ├── DocumentPreview.tsx         # Left panel - DOCX viewer
│   ├── ReviewInterface.tsx         # Right panel - Review cards
│   ├── StickyHeader.tsx            # Metadata + Search + Filters
│   ├── ReviewCard.tsx              # Expandable compliance card
│   ├── ComplianceBadge.tsx         # Y/N status badge
│   ├── SearchBar.tsx               # Search input
│   ├── FilterButtons.tsx           # Compliance filters
│   └── ExportButton.tsx            # Export button (UI only)
├── lib/
│   ├── types.ts                    # TypeScript interfaces
│   ├── mockData.ts                 # Mock API responses
│   └── utils.ts                    # Helper functions
├── public/
│   └── sample-agreement.docx       # Sample file for testing
└── README.md
```

---

## Core Features

### 1. File Upload Component

**Location**: Header bar (top left)

**Features**:
- Accept `.docx` files only
- File size validation (max 10MB)
- Drag & drop support
- Upload progress indicator
- Error handling

**UI States**:
```
Initial:     [📤 Upload Agreement]
Uploading:   [⏳ Analyzing... 45%]
Success:     [✓ Hotel-Airline Rate Agreement.docx]
Error:       [❌ Upload failed - Try again]
```

**Implementation Notes**:
- Use HTML5 File API
- Validate MIME type and extension
- Show loading spinner during upload
- Clear previous results on new upload

---

### 2. Document Preview (Left Panel)

**Features**:
- DOCX to HTML conversion using Mammoth.js
- Scrollable document view
- Zoom controls (100%, 125%, 150%)
- Maintains original formatting
- Empty state when no document

**Implementation Notes**:
- Convert DOCX in browser (no backend needed)
- Use `dangerouslySetInnerHTML` for HTML rendering
- Add CSS for document styling
- Implement zoom with CSS transform

---

### 3. Review Interface (Right Panel)

**Layout**: Expandable card-based design

#### A. Sticky Header
- Document metadata (title, hotel, airline, airport code)
- Compliance statistics (X/Y compliant fields)
- Progress bar
- Search bar
- Filter buttons (All, Compliant, Non-Compliant)
- Expand/Collapse All button

#### B. Alert Banner (Conditional)
- Shows flags and ambiguous points
- Yellow warning style
- Dismissible

#### C. Review Cards
Each card shows:
- **Collapsed State**:
  - Field name
  - Compliance status (Y/N badge)
  - Brief comment preview
  - Expand/collapse icon
  
- **Expanded State**:
  - Review comment (full)
  - Extracted content
  - Full document section (snippet)
  - Color-coded border (green/red)

**Implementation Notes**:
- Use Set for tracking expanded items
- Dynamic rendering (no hardcoded fields)
- Smooth expand/collapse animation
- Highlight search matches

---

### 4. Search & Filter

**Search**:
- Search across field names, comments, and content
- Real-time filtering
- Highlight matching text
- Debounced input (300ms)

**Filter**:
- All (default)
- Compliant (Y)
- Non-Compliant (N)
- Show count badges

**Expand/Collapse All**:
- Toggle all cards at once
- Remember state per session

---

### 5. Responsive Design

**Desktop (1920px+)**:
- Full split view (50-50)
- All features visible

**Laptop (1440px)**:
- Maintain split view
- Adjust spacing

**Tablet (768px - 1024px)**:
- Stack vertically
- Document top (40%), Review bottom (60%)

**Mobile (< 768px)**:
- Single column
- Tab navigation: "Document" | "Review"
- Simplified cards

---

## Data Flow

```
┌─────────────────────────────────────────────────┐
│  User uploads .docx file                         │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Frontend validates file                         │
│  - Check extension (.docx)                       │
│  - Check size (< 10MB)                          │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Convert DOCX to HTML (Mammoth.js)              │
│  - Display in left panel                        │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Send file to API (when backend ready)          │
│  - POST /api/analyze                            │
│  - FormData with file                           │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Receive JSON response                           │
│  - Parse output_parsed                          │
│  - Update state                                 │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Render review interface                         │
│  - Display metadata                             │
│  - Render review cards                          │
│  - Enable search/filter                         │
└─────────────────────────────────────────────────┘
```

---

## TypeScript Interfaces

```typescript
// API Response Structure
interface ApiResponse {
  status: "success" | "error";
  file_name: string;
  output_parsed: {
    meta: DocumentMeta;
    review: ReviewField[];
    snippets: Snippet[];
    flags: Flags;
  };
}

interface DocumentMeta {
  document_title: string;
  station_or_airport_code: string;
  hotel_name: string;
  airline_name: string;
}

interface ReviewField {
  field: string;              // Dynamic field name
  actual_content: string;     // Extracted text
  compliant: "Y" | "N";       // Compliance status
  comment: string;            // Review comment
}

interface Snippet {
  label: string;              // Section label
  text: string;               // Full text
  page_or_section: string;    // Location reference
}

interface Flags {
  missing_fields: string[];
  ambiguous_points: string[];
}
```

---

## Mock Data for Testing

Create `lib/mockData.ts` with sample responses:

```typescript
export const mockApiResponse: ApiResponse = {
  status: "success",
  file_name: "Hotel-Airline Rate Agreement - Sample.docx",
  output_parsed: {
    meta: {
      document_title: "HOTEL CREW RATE AGREEMENT",
      station_or_airport_code: "QNM",
      hotel_name: "The Riverside Hotel, PQR",
      airline_name: "SkyFleet Airways, Inc."
    },
    review: [
      {
        field: "Name (Parties)",
        actual_content: "This Agreement is made between SkyFleet Airways, Inc. and The Riverside Hotel, PQR",
        compliant: "Y",
        comment: "Both parties' full legal names and addresses are present."
      },
      {
        field: "Start Date",
        actual_content: "January 1, 2025",
        compliant: "Y",
        comment: "Start date is clearly specified."
      },
      {
        field: "End Date",
        actual_content: "",
        compliant: "N",
        comment: "End date is not specified. Agreement should have a clear termination date."
      },
      // Add more fields...
    ],
    snippets: [
      {
        label: "Room Rate & Reservations",
        text: "The Hotel will provide rooms for the Airline's crew members at the agreed rate of $89 per night...",
        page_or_section: "Section 1(a)"
      }
    ],
    flags: {
      missing_fields: ["End Date", "Termination Clause"],
      ambiguous_points: ["Payment terms are not clearly defined"]
    }
  }
};
```

---

## API Integration Layer

Create API route that's ready for backend integration:

```typescript
// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // TODO: Replace with actual backend URL when ready
    const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8000";
    
    const response = await fetch(`${BACKEND_URL}/analyze`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      status: data.status,
      output_parsed: data.output_parsed,
      file_name: data.file_name,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    
    // For POC: Return mock data if backend not available
    if (process.env.NODE_ENV === "development") {
      const { mockApiResponse } = await import("@/lib/mockData");
      return NextResponse.json(mockApiResponse);
    }
    
    return NextResponse.json(
      { error: "Failed to analyze document" },
      { status: 500 }
    );
  }
}
```

---

## Implementation Steps

### Phase 1: Project Setup (Day 1)
1. ✅ Create Next.js project with TypeScript
2. ✅ Install dependencies
3. ✅ Set up Tailwind CSS
4. ✅ Create folder structure
5. ✅ Add TypeScript interfaces
6. ✅ Create mock data

### Phase 2: Core Components (Days 2-3)
1. ✅ Build FileUpload component
2. ✅ Implement file validation
3. ✅ Create DocumentPreview with Mammoth.js
4. ✅ Add zoom controls
5. ✅ Build main page layout (split view)

### Phase 3: Review Interface (Days 4-5)
1. ✅ Create StickyHeader component
2. ✅ Build ReviewCard component
3. ✅ Implement expand/collapse logic
4. ✅ Add ComplianceBadge component
5. ✅ Display snippets

### Phase 4: Search & Filter (Day 6)
1. ✅ Implement SearchBar component
2. ✅ Add text highlighting
3. ✅ Build FilterButtons component
4. ✅ Add expand/collapse all functionality

### Phase 5: Polish & Testing (Days 7-8)
1. ✅ Add loading states
2. ✅ Implement error handling
3. ✅ Add animations
4. ✅ Responsive design
5. ✅ Browser testing
6. ✅ Performance optimization

---

## Testing Checklist

### File Upload
- [ ] Upload valid .docx file
- [ ] Reject .pdf, .doc, .txt files
- [ ] Reject files > 10MB
- [ ] Show upload progress
- [ ] Display error messages
- [ ] Clear previous results on new upload

### Document Preview
- [ ] DOCX converts to HTML correctly
- [ ] Formatting preserved
- [ ] Scrolling works smoothly
- [ ] Zoom controls work (100%, 125%, 150%)
- [ ] Empty state displays correctly

### Review Interface
- [ ] Metadata displays correctly
- [ ] Compliance stats calculate correctly
- [ ] Cards render dynamically
- [ ] Expand/collapse works
- [ ] Snippets display correctly
- [ ] Alert banner shows when flags exist

### Search & Filter
- [ ] Search filters results correctly
- [ ] Matching text highlights
- [ ] Filter buttons work (All, Y, N)
- [ ] Counts update correctly
- [ ] Expand/collapse all works

### Responsive Design
- [ ] Desktop view (1920px+)
- [ ] Laptop view (1440px)
- [ ] Tablet view (768px-1024px)
- [ ] Mobile view (<768px)

### Error Handling
- [ ] Invalid file type error
- [ ] File size error
- [ ] API error (when backend unavailable)
- [ ] Network timeout
- [ ] Parse error

---

## Environment Variables

Create `.env.local`:

```bash
# Backend API URL (when ready)
BACKEND_API_URL=http://localhost:8000

# Feature flags
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_MAX_FILE_SIZE_MB=10
```

---

## Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "lucide-react": "^0.263.1",
    "mammoth": "^1.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0"
  }
}
```

---

## Key Implementation Notes

### 1. Dynamic Field Rendering
- **Never hardcode field names**
- Use `.map()` to render all fields
- Handle varying number of fields
- Support any field structure from backend

### 2. State Management
```typescript
const [file, setFile] = useState<File | null>(null);
const [reviewData, setReviewData] = useState<ApiResponse | null>(null);
const [searchTerm, setSearchTerm] = useState("");
const [filterCompliance, setFilterCompliance] = useState<"all" | "Y" | "N">("all");
const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
```

### 3. Performance Optimization
- Debounce search input (300ms)
- Use `useMemo` for filtered data
- Lazy load document sections
- Optimize re-renders with `React.memo`

### 4. Accessibility
- Keyboard navigation
- ARIA labels
- Focus management
- Screen reader support

---

## Future Enhancements (Post-POC)

These features are **not** part of the POC but can be added later:

1. **Export Functionality**
   - PDF export
   - Excel export
   - Annotated Word document

2. **Manual Editing**
   - Override AI decisions
   - Add custom comments
   - Edit compliance status

3. **Document Highlighting**
   - Click field to highlight in document
   - Scroll to relevant section

4. **Comparison View**
   - Compare multiple agreements side-by-side

5. **Batch Processing**
   - Upload multiple files
   - Process in parallel

6. **Collaboration**
   - Comments
   - Assignment
   - Approval workflow

---

## Success Criteria

The POC is considered successful when:

✅ User can upload a .docx file  
✅ Document displays in left panel with proper formatting  
✅ Review interface shows all compliance fields  
✅ Cards expand/collapse smoothly  
✅ Search filters results correctly  
✅ Filter buttons work (All, Y, N)  
✅ UI is responsive on all devices  
✅ Error handling works for all scenarios  
✅ Mock data integration works  
✅ API layer is ready for backend integration  

---

## Timeline

**Total Duration**: 8 days

- **Days 1**: Project setup
- **Days 2-3**: Core components
- **Days 4-5**: Review interface
- **Day 6**: Search & filter
- **Days 7-8**: Polish & testing

---

## Contact & Support

**Development Team**
- Frontend Lead: [Your Name]
- Backend Team: [Backend Team Contact]

**Documentation**
- Initial Plan: `docs/Initial.md`
- POC Implementation: `docs/POC-Implementation.md`
- Progress Tracking: `docs/Progress.md`

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-06  
**Status**: Ready for Implementation
