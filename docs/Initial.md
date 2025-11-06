# Hotel Agreement Review System - Implementation Plan

## 1. Project Overview

### Purpose

Automate and streamline the manual hotel-airline agreement compliance review process. The system allows users to upload DOCX files, automatically extracts and reviews compliance fields, and provides an interactive UI for efficient review and validation.

### Target Users

Compliance officers, legal teams, and contract managers who manually review hotel-airline rate agreements.

### Current Pain Point

Manual document review is tedious and time-consuming. Reviewers must:

- Read through lengthy agreements
- Cross-reference multiple sections
- Track compliance for 9+ different fields
- Manually mark each field as compliant/non-compliant
- Spend 30+ minutes per agreement

### Solution

Automated AI-powered extraction + Interactive split-view UI = 80% time savings

---

## 13. Security Considerations

### 13.1 File Upload Security

```typescript
// Validate MIME type and extension
const validateFile = (file: File): boolean => {
  const validExtensions = [".docx"];
  const validMimeTypes = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));

  return validExtensions.includes(extension) && validMimeTypes.includes(file.type);
};

// Sanitize filename
const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 255);
};
```

### 13.2 API Security

- Add rate limiting (max 10 uploads per minute per IP)
- Implement CORS restrictions
- Validate all inputs
- Sanitize error messages (don't leak sensitive info)
- Use HTTPS in production

### 13.3 Data Privacy

- Files processed in memory (no persistent storage)
- Temporary file cleanup after processing
- No logging of sensitive document content
- Clear session data on page refresh

---

## 14. Deployment Strategy

### 14.1 Development Environment

```bash
# Frontend
cd frontend
npm install
npm run dev  # localhost:3000

# Backend (separate terminal)
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload  # localhost:8000
```

### 14.2 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=.docx
```

### 14.3 Production Deployment

**Frontend (Vercel)**

```bash
# Deploy to Vercel
vercel --prod

# Environment variables to set in Vercel:
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

**Backend (AWS Lambda / Cloud Run / Railway)**

```yaml
# Example: Railway deployment
services:
  backend:
    build:
      context: ./backend
    env:
      ALLOWED_ORIGINS: https://yourdomain.com
      MAX_UPLOAD_SIZE: 10485760
```

### 14.4 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy agreement-api \
            --source . \
            --region us-central1
```

---

## 15. User Guide & Documentation

### 15.1 Quick Start Guide

**Step 1: Upload Document**

1. Click "Upload Agreement" button
2. Select a .docx file from your computer
3. Wait for analysis (usually 10-30 seconds)

**Step 2: Review Results**

- Left panel shows original document
- Right panel shows AI-extracted compliance review
- Green = Compliant, Red = Non-compliant

**Step 3: Search & Filter**

- Use search bar to find specific terms
- Filter by compliance status
- Expand cards to see detailed analysis

**Step 4: Export Results**

- Click "Export Review" button (coming soon)
- Download PDF or Excel report

### 15.2 Understanding the Review

**Compliance Status**

- ✅ **Compliant (Y)**: Field meets all requirements
- ❌ **Non-Compliant (N)**: Field missing or doesn't meet requirements

**Review Sections**

- **Review Comment**: AI's assessment
- **Extracted Content**: Text found in document
- **Full Document Section**: Context from original agreement

**Flags & Alerts**

- 🟡 **Ambiguous Points**: Items needing human verification
- 🔴 **Missing Fields**: Required fields not found in document

---

## 16. Future Enhancements (Phase 2)

### 16.1 Export Functionality

```typescript
// PDF Export
const exportToPDF = async (data: ReviewData) => {
  const pdf = new jsPDF();

  // Add header
  pdf.setFontSize(20);
  pdf.text("Compliance Review Report", 20, 20);

  // Add metadata
  pdf.setFontSize(12);
  pdf.text(`Hotel: ${data.meta.hotel_name}`, 20, 40);
  pdf.text(`Airline: ${data.meta.airline_name}`, 20, 50);

  // Add compliance summary
  const stats = calculateStats(data.review);
  pdf.text(`Compliance: ${stats.compliant}/${stats.total} (${stats.percentage}%)`, 20, 70);

  // Add review items
  data.review.forEach((item, index) => {
    const y = 90 + index * 40;
    pdf.text(`${item.field}: ${item.compliant}`, 20, y);
    pdf.text(item.comment, 20, y + 10);
  });

  pdf.save(`${data.meta.document_title}_Review.pdf`);
};

// Excel Export
const exportToExcel = (data: ReviewData) => {
  const worksheet = XLSX.utils.json_to_sheet(
    data.review.map((item) => ({
      Field: item.field,
      Compliant: item.compliant,
      Comment: item.comment,
      Content: item.actual_content,
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Review");
  XLSX.writeFile(workbook, `${data.meta.document_title}_Review.xlsx`);
};
```

### 16.2 Manual Editing

Allow users to override AI decisions:

```jsx
const EditableComplianceStatus = ({ field, initialStatus, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(initialStatus);

  const handleSave = () => {
    onUpdate(field, status);
    setIsEditing(false);
  };

  return (
    <div>
      {isEditing ? (
        <>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Y">Compliant</option>
            <option value="N">Non-Compliant</option>
          </select>
          <button onClick={handleSave}>Save</button>
        </>
      ) : (
        <>
          <ComplianceBadge status={status} />
          <button onClick={() => setIsEditing(true)}>Edit</button>
        </>
      )}
    </div>
  );
};
```

### 16.3 Document Highlighting

Click on a review field to highlight corresponding text in document:

```jsx
const DocumentPreview = ({ file, highlightedText }) => {
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    if (highlightedText) {
      // Wrap matching text in <mark> tags
      const highlighted = htmlContent.replace(
        new RegExp(highlightedText, "gi"),
        '<mark class="bg-yellow-300">---</mark>'
      );
      setHtmlContent(highlighted);
    }
  }, [highlightedText]);

  // ... rest of component
};
```

### 16.4 Comparison View

Compare multiple agreements side-by-side:

```jsx
const ComparisonView = ({ agreements }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {agreements.map((agreement) => (
        <div key={agreement.id}>
          <h3>{agreement.meta.hotel_name}</h3>
          <ComplianceTable data={agreement.review} />
        </div>
      ))}
    </div>
  );
};
```

### 16.5 Batch Processing

Upload and process multiple files at once:

```jsx
const BatchUpload = () => {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);

  const handleBatchUpload = async () => {
    const promises = files.map((file) => analyzeDocument(file));
    const results = await Promise.all(promises);
    setResults(results);
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept=".docx"
        onChange={(e) => setFiles(Array.from(e.target.files))}
      />
      <button onClick={handleBatchUpload}>Analyze All</button>
      <BatchResultsTable results={results} />
    </div>
  );
};
```

### 16.6 AI Suggestions

Provide suggestions for non-compliant fields:

```typescript
interface Suggestion {
  field: string;
  issue: string;
  suggestion: string;
  confidence: number;
}

const SuggestionPanel = ({ suggestions }) => {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
      <h3>💡 AI Suggestions</h3>
      {suggestions.map((s) => (
        <div key={s.field} className="mt-2">
          <strong>{s.field}</strong>
          <p className="text-sm">{s.issue}</p>
          <p className="text-sm text-blue-700">Suggestion: {s.suggestion}</p>
          <span className="text-xs">Confidence: {s.confidence}%</span>
        </div>
      ))}
    </div>
  );
};
```

### 16.7 Collaboration Features

- **Comments**: Add notes to specific fields
- **Assignment**: Assign fields to team members for review
- **History**: Track changes and review history
- **Approval Workflow**: Multi-step approval process

---

## 17. Success Metrics & KPIs

### 17.1 Performance Metrics

| Metric               | Target  | Measurement      |
| -------------------- | ------- | ---------------- |
| Upload time          | < 5s    | 95th percentile  |
| Analysis time        | < 30s   | Average          |
| Document render time | < 3s    | 95th percentile  |
| Search response time | < 100ms | Average          |
| Page load time       | < 2s    | Lighthouse score |

### 17.2 Usage Metrics

| Metric                  | Target   | Period           |
| ----------------------- | -------- | ---------------- |
| Active users            | 50+      | Monthly          |
| Documents analyzed      | 200+     | Monthly          |
| Average time per review | < 5 min  | Per document     |
| User satisfaction       | 4+ stars | Quarterly survey |
| Error rate              | < 2%     | Monthly          |

### 17.3 Business Impact

- **Time savings**: 25 minutes per agreement
- **Cost savings**: $X per review (labor cost)
- **Accuracy improvement**: 95%+ compliance detection
- **User adoption**: 80% of team within 3 months
- **ROI**: Break-even within 6 months

### 17.4 Analytics Dashboard

```jsx
const AnalyticsDashboard = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <MetricCard title="Documents Analyzed" value={1247} change="+12%" period="This month" />
      <MetricCard title="Avg Review Time" value="4.2 min" change="-38%" period="vs manual" />
      <MetricCard title="Compliance Rate" value="73%" change="+5%" period="This quarter" />
      <MetricCard title="User Satisfaction" value="4.6/5" change="+0.3" period="Last survey" />
    </div>
  );
};
```

---

## 18. Troubleshooting Guide

### 18.1 Common Issues

**Issue: Upload fails with "Invalid file type"**

- **Cause**: File is not .docx format or has wrong MIME type
- **Solution**: Ensure file is saved as .docx (not .doc)
- **Prevention**: Use Word 2007+ or convert using online tool

**Issue: Analysis takes too long (> 1 minute)**

- **Cause**: Large document or slow backend
- **Solution**: Check network connection, try smaller file
- **Prevention**: Optimize document (remove images, reduce size)

**Issue: Document preview shows garbled text**

- **Cause**: Mammoth.js conversion error or special characters
- **Solution**: Try re-saving document in Word
- **Prevention**: Use standard fonts and formatting

**Issue: Search not finding text that's visible**

- **Cause**: Text in image or special formatting
- **Solution**: Manual review of that section
- **Prevention**: Ensure text is selectable (not embedded)

**Issue: Some fields show as "Non-Compliant" incorrectly**

- **Cause**: AI misinterpretation or edge case
- **Solution**: Manual override (Phase 2 feature)
- **Prevention**: Report to team for model improvement

### 18.2 Error Messages & Solutions

| Error            | Meaning               | Solution                                    |
| ---------------- | --------------------- | ------------------------------------------- |
| `FILE_TOO_LARGE` | File exceeds 10MB     | Compress or split document                  |
| `INVALID_FORMAT` | Not a valid .docx     | Save as .docx in Word                       |
| `PARSE_ERROR`    | Can't read document   | Check for corruption, try re-saving         |
| `BACKEND_ERROR`  | API failed            | Wait and retry, contact support if persists |
| `TIMEOUT`        | Request took too long | Check connection, try again                 |
| `NETWORK_ERROR`  | Can't reach server    | Check internet, verify API URL              |

---

## 19. Maintenance & Support

### 19.1 Monitoring

```javascript
// Error tracking
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

// Log critical errors
try {
  await analyzeDocument(file);
} catch (error) {
  Sentry.captureException(error);
  showErrorToast("Analysis failed");
}

// Performance monitoring
const startTime = performance.now();
await analyzeDocument(file);
const duration = performance.now() - startTime;
logMetric("analysis_duration", duration);
```

### 19.2 Logging

```javascript
// Structured logging
const log = {
  level: "info",
  timestamp: new Date().toISOString(),
  event: "document_uploaded",
  metadata: {
    fileSize: file.size,
    fileName: file.name,
    userId: user.id,
  },
};

console.log(JSON.stringify(log));
```

### 19.3 Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      backend: await checkBackendHealth(),
      database: await checkDatabaseHealth(),
    },
  };

  const status = Object.values(health.services).every((s) => s.healthy) ? 200 : 503;

  return NextResponse.json(health, { status });
}
```

### 19.4 Regular Maintenance Tasks

**Weekly**

- Review error logs
- Check performance metrics
- Monitor API usage
- Update dependencies (security patches)

**Monthly**

- Analyze usage patterns
- Review user feedback
- Performance optimization
- Backup configurations

**Quarterly**

- Security audit
- User survey
- Feature prioritization
- Infrastructure review

---

## 20. Appendices

### Appendix A: Sample API Request/Response

**Request**

```bash
curl -X 'POST' \
  'http://localhost:8000/analyze' \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@Hotel-Airline_Rate_Agreement.docx' \
  -F 'try_parse_json=true'
```

**Response**

```json
{
  "status": "success",
  "run_id": "690c3fd237a5e2c1f4a0b6f4",
  "file_name": "Hotel-Airline Rate Agreement - Sample B.docx",
  "output_parsed": {
    "meta": {
      "document_title": "HOTEL CREW RATE AGREEMENT",
      "station_or_airport_code": "QNM",
      "hotel_name": "The Riverside Hotel, PQR",
      "airline_name": "SkyFleet Airways, Inc."
    },
    "review": [
      {
        "field": "Name (Parties)",
        "actual_content": "This Agreement is made between...",
        "compliant": "Y",
        "comment": "Both parties' full legal names and addresses are present."
      }
    ],
    "snippets": [
      {
        "label": "Room Rate & Reservations",
        "text": "The Hotel will provide rooms for the Airline...",
        "page_or_section": "Section 1(a)"
      }
    ],
    "flags": {
      "missing_fields": [],
      "ambiguous_points": []
    }
  }
}
```

### Appendix B: Dependencies

**Frontend (package.json)**

```json
{
  "name": "agreement-review-ui",
  "version": "1.0.0",
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "lucide-react": "^0.263.1",
    "mammoth": "^1.6.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "typescript": "^5.0.0",
    "eslint": "^8.57.0",
    "prettier": "^3.0.0"
  }
}
```

**Backend (requirements.txt)**

```txt
fastapi==0.110.0
uvicorn==0.27.0
python-multipart==0.0.9
python-docx==1.1.0
pydantic==2.6.0
```

### Appendix C: Glossary

- **Compliance**: Meeting all requirements specified in the review criteria
- **LRA**: Last Room Availability - hotel must provide rooms even when fully booked
- **IROP**: Irregular Operations - unscheduled airline operations due to delays/cancellations
- **GDS**: Global Distribution System - reservation system used by airlines
- **Blackout dates**: Dates when special rates don't apply (should be none for crew)
- **Ad Hoc Rate**: Special rate for unplanned/emergency bookings
- **Snippet**: Relevant excerpt from the original document

### Appendix D: Contact & Support

**Development Team**

- Frontend Lead: [Name]
- Backend Lead: [Name]
- Product Manager: [Name]

**Support Channels**

- Email: support@yourdomain.com
- Slack: #agreement-review-support
- Documentation: https://docs.yourdomain.com

**Feedback**

- Feature requests: https://feedback.yourdomain.com
- Bug reports: https://github.com/yourorg/agreement-review/issues

---

## Document History

| Version | Date       | Author              | Changes             |
| ------- | ---------- | ------------------- | ------------------- |
| 1.0     | 2025-11-06 | Implementation Team | Initial document    |
| 1.1     | TBD        | TBD                 | Post-launch updates |

---

**End of Implementation Plan**

_This document is a living guide and will be updated as the project evolves._

## 2. System Architecture

### Tech Stack

- **Frontend**: Next.js 14+ (App Router)
- **UI Components**: Tailwind CSS + Lucide React (icons)
- **File Upload**: Next.js API Routes with multipart/form-data
- **Document Preview**: Mammoth.js (DOCX to HTML conversion)
- **State Management**: React useState/useContext
- **API Communication**: Fetch API

### Backend API

- **Base URL**: `http://localhost:8000` (Development)
- **Endpoint**: `POST /analyze`
- **Request Format**: multipart/form-data
- **Response Format**: JSON with `output_parsed` object

---

## 3. Page Layout

### Split View Design (50-50)

```
┌─────────────────────────────────────────────────────────────┐
│  Header: [Upload Button] | File Name | [Export Button]      │
├──────────────────────────┬──────────────────────────────────┤
│                          │                                   │
│  LEFT PANEL (50%)        │  RIGHT PANEL (50%)               │
│  Document Preview        │  Review Interface (Option B)     │
│                          │                                   │
│  ┌────────────────────┐  │  ┌────────────────────────────┐  │
│  │  Original DOCX     │  │  │  Sticky Header             │  │
│  │  Converted to HTML │  │  │  - Metadata                │  │
│  │                    │  │  │  - Search Bar              │  │
│  │  Scrollable        │  │  │  - Filter Buttons          │  │
│  │  Document View     │  │  └────────────────────────────┘  │
│  │                    │  │                                   │
│  │  [Zoom Controls]   │  │  ┌────────────────────────────┐  │
│  │                    │  │  │  Expandable Cards          │  │
│  │                    │  │  │  ┌──────────────────────┐  │  │
│  │                    │  │  │  │ Field 1 (Collapsed)  │  │  │
│  │                    │  │  │  └──────────────────────┘  │  │
│  │                    │  │  │  ┌──────────────────────┐  │  │
│  │                    │  │  │  │ Field 2 (Expanded)   │  │  │
│  │                    │  │  │  │ - Review Comment     │  │  │
│  │                    │  │  │  │ - Actual Content     │  │  │
│  │                    │  │  │  │ - Document Snippet   │  │  │
│  │                    │  │  │  └──────────────────────┘  │  │
│  │                    │  │  │  ...                       │  │
│  └────────────────────┘  │  └────────────────────────────┘  │
│                          │                                   │
└──────────────────────────┴──────────────────────────────────┘
```

---

## 4. Feature Requirements

### 4.1 File Upload Component

**Location**: Top left of header bar

**Requirements**:

- Accept `.docx` files only
- Max file size: 10MB
- Show upload progress indicator
- Display file name after successful upload
- Clear previous results on new upload

**UI States**:

```
Initial:     [📤 Upload Agreement]
Uploading:   [⏳ Analyzing... 45%]
Success:     [✓ Hotel-Airline Rate Agreement - Sample B.docx]
Error:       [❌ Upload failed - Try again]
```

**Implementation**:

```jsx
const FileUpload = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file) => {
    if (!file.name.endsWith(".docx")) {
      toast.error("Please upload a .docx file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("try_parse_json", "true");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.status === "success") {
        onUploadSuccess({
          parsed: data.output_parsed,
          fileName: data.file_name,
          file: file,
        });
      }
    } catch (error) {
      toast.error("Failed to analyze document");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <label className="cursor-pointer">
      <input
        type="file"
        accept=".docx"
        onChange={(e) => handleUpload(e.target.files[0])}
        className="hidden"
      />
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
        {isUploading ? "Analyzing..." : "Upload Agreement"}
      </button>
    </label>
  );
};
```

---

### 4.2 Document Preview (Left Panel)

**Implementation**: Use Mammoth.js to convert DOCX to HTML

**Features**:

- Full document rendering with original formatting
- Smooth scrolling
- Zoom controls (100%, 125%, 150%)
- Responsive width adjustment

**Code Example**:

```jsx
import mammoth from "mammoth";

const DocumentPreview = ({ file }) => {
  const [htmlContent, setHtmlContent] = useState("");
  const [zoom, setZoom] = useState(100);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const convertDocument = async () => {
      if (!file) return;

      setIsLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({
          arrayBuffer,
          styleMap: ["p[style-name='Heading 1'] => h1", "p[style-name='Heading 2'] => h2"],
        });
        setHtmlContent(result.value);
      } catch (error) {
        console.error("Failed to convert document:", error);
      } finally {
        setIsLoading(false);
      }
    };

    convertDocument();
  }, [file]);

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center text-gray-400">
          <FileText className="w-16 h-16 mx-auto mb-4" />
          <p>Upload a document to preview</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Zoom Controls */}
      <div className="flex items-center justify-end gap-2 p-4 border-b">
        <button onClick={() => setZoom(Math.max(50, zoom - 25))}>
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium">{zoom}%</span>
        <button onClick={() => setZoom(Math.min(200, zoom + 25))}>
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-auto p-8">
        <div
          className="mx-auto bg-white shadow-lg"
          style={{
            width: `${zoom}%`,
            maxWidth: "850px",
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} className="prose max-w-none p-8" />
        </div>
      </div>
    </div>
  );
};
```

---

### 4.3 Review Interface (Right Panel - Option B)

**Design**: Expandable card-based layout with sticky header

#### Key Components:

**A. Sticky Header Section**

```jsx
<div className="sticky top-0 z-20 bg-white border-b shadow-sm">
  {/* Document Metadata */}
  <div className="flex items-center justify-between p-4">
    <div>
      <h1>{meta.document_title}</h1>
      <div className="flex gap-4 text-sm text-gray-600">
        <span>🏨 {meta.hotel_name}</span>
        <span>✈️ {meta.airline_name}</span>
        <span className="badge">{meta.station_or_airport_code}</span>
      </div>
    </div>
    <div className="text-right">
      <div className="text-3xl font-bold">6/9</div>
      <div className="text-sm">Compliant Fields</div>
      <ProgressBar percentage={67} />
    </div>
  </div>

  {/* Search & Filters */}
  <div className="flex gap-4 p-4">
    <SearchBar />
    <FilterButton active="all" count={9} />
    <FilterButton active="Y" count={6} color="green" />
    <FilterButton active="N" count={3} color="red" />
    <ExpandAllButton />
  </div>
</div>
```

**B. Alert Banner (if flags exist)**

```jsx
{
  flags.ambiguous_points.length > 0 && (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
      <AlertCircle className="text-amber-600" />
      <h3>Attention Required</h3>
      <ul>
        {flags.ambiguous_points.map((point) => (
          <li key={point}>• {point}</li>
        ))}
      </ul>
    </div>
  );
}
```

**C. Expandable Cards**

```jsx
{
  filteredReviewData.map((item) => {
    const isExpanded = expandedItems.has(item.field);
    const snippet = getRelatedSnippet(item.field);

    return (
      <div className={`card ${item.compliant === "Y" ? "border-green-200" : "border-red-200"}`}>
        {/* Collapsed Header */}
        <div onClick={() => toggleExpand(item.field)} className="cursor-pointer p-4">
          <ChevronIcon />
          <ComplianceIcon compliant={item.compliant} />
          <div>
            <h3>{item.field}</h3>
            <p className="text-sm text-gray-600 line-clamp-1">{item.comment}</p>
          </div>
          <Badge>{item.compliant === "Y" ? "Compliant" : "Non-Compliant"}</Badge>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t p-6 space-y-4">
            {/* Review Comment */}
            <Section title="Review Comment">
              <div className="bg-blue-50 p-4 rounded-lg">
                {highlightText(item.comment, searchTerm)}
              </div>
            </Section>

            {/* Extracted Content */}
            <Section title="Extracted Content">
              <div className="bg-gray-50 p-4 rounded-lg">
                {item.actual_content || <EmptyState />}
              </div>
            </Section>

            {/* Full Document Section */}
            {snippet && (
              <Section title="Full Document Section">
                <div className="border-2 rounded-lg">
                  <div className="bg-gray-100 p-3">
                    <div className="font-medium">{snippet.label}</div>
                    <div className="text-xs text-gray-600">{snippet.page_or_section}</div>
                  </div>
                  <div className="p-4 bg-white">{highlightText(snippet.text, searchTerm)}</div>
                </div>
              </Section>
            )}
          </div>
        )}
      </div>
    );
  });
}
```

---

### 4.4 Dynamic Field Handling

**Challenge**: Backend may return different fields for different agreements

**Solution**: Use `.map()` to dynamically render all fields

```typescript
// Type definition
interface ReviewField {
  field: string; // Dynamic field name
  actual_content: string; // Extracted text
  compliant: "Y" | "N"; // Compliance status
  comment: string; // Review comment
}

// Dynamic rendering
const ReviewCards = ({ data }) => {
  // No hardcoded field names - handles any number of fields
  return data.review.map((item: ReviewField) => <ReviewCard key={item.field} data={item} />);
};
```

**Example Field Variations**:

```
Agreement A might have:
- Name (Parties)
- Start Date
- End Date
- Room Capping
... (9 fields)

Agreement B might have:
- Parties
- Effective Date
- Termination Date
- Rate Structure
- Payment Terms
... (12 fields)

✅ UI automatically adapts to any number of fields
```

---

### 4.5 Search & Filter Functionality

**Search Implementation**:

```javascript
const [searchTerm, setSearchTerm] = useState("");

const filteredData = useMemo(() => {
  if (!searchTerm) return reviewData;

  const term = searchTerm.toLowerCase();
  return reviewData.filter(
    (item) =>
      item.field.toLowerCase().includes(term) ||
      item.actual_content.toLowerCase().includes(term) ||
      item.comment.toLowerCase().includes(term)
  );
}, [reviewData, searchTerm]);

// Highlight matches
const highlightText = (text, search) => {
  if (!search) return text;
  const regex = new RegExp(`(${search})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) => (regex.test(part) ? <mark key={i}>{part}</mark> : part));
};
```

**Filter Implementation**:

```javascript
const [filterCompliance, setFilterCompliance] = useState("all");

const filteredByCompliance = useMemo(() => {
  if (filterCompliance === "all") return filteredData;
  return filteredData.filter((item) => item.compliant === filterCompliance);
}, [filteredData, filterCompliance]);
```

**Expand/Collapse All**:

```javascript
const [expandedItems, setExpandedItems] = useState(new Set());
const [expandAll, setExpandAll] = useState(false);

const toggleExpandAll = () => {
  if (expandAll) {
    setExpandedItems(new Set());
  } else {
    setExpandedItems(new Set(reviewData.map((item) => item.field)));
  }
  setExpandAll(!expandAll);
};
```

---

### 4.6 Export Button

**Location**: Fixed position at bottom right

**Design**:

```jsx
<button className="fixed bottom-6 right-6 z-30 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 flex items-center gap-2 transition-all">
  <Download className="w-5 h-5" />
  Export Review
</button>
```

**Phase 1**: Static button (no functionality)

**Phase 2** (Future): Export options

- Export as PDF report
- Export as Excel spreadsheet
- Export as annotated Word document
- Export compliance summary only

---

## 5. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     USER UPLOADS FILE                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (Next.js)                              │
│  1. Validate file (.docx, < 10MB)                           │
│  2. Create FormData                                          │
│  3. Show loading state                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ POST /api/analyze
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS API ROUTE (Proxy)                       │
│  Forward request to Python backend                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ POST http://localhost:8000/analyze
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              PYTHON BACKEND                                  │
│  1. Receive DOCX file                                        │
│  2. Extract text and structure                               │
│  3. AI analyzes compliance                                   │
│  4. Return JSON response                                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ JSON Response
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND RECEIVES DATA                          │
│  1. Parse output_parsed                                      │
│  2. Update state                                             │
│  3. Render UI                                                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  SPLIT VIEW RENDERS                          │
│  LEFT: Document preview (Mammoth.js)                         │
│  RIGHT: Review interface (Option B)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Component Architecture

### 6.1 File Structure

```
app/
├── page.tsx                          # Main page with split view
├── layout.tsx                        # Root layout
├── globals.css                       # Tailwind styles
├── api/
│   └── analyze/
│       └── route.ts                  # API proxy to Python backend
└── components/
    ├── FileUpload.tsx                # Upload button & logic
    ├── DocumentPreview.tsx           # Left panel - DOCX viewer
    ├── ReviewInterface.tsx           # Right panel - Option B
    │   ├── StickyHeader.tsx          # Metadata + Search + Filters
    │   ├── AlertBanner.tsx           # Flags/warnings
    │   ├── ReviewCard.tsx            # Expandable card component
    │   ├── ComplianceIcon.tsx        # ✓ or ✗ icon
    │   └── SnippetDisplay.tsx        # Document snippet section
    ├── SearchBar.tsx                 # Search input
    ├── FilterButtons.tsx             # Compliance filter buttons
    ├── HighlightText.tsx             # Text highlighting utility
    └── ExportButton.tsx              # Fixed export button
```

### 6.2 Main Page Component

```tsx
// app/page.tsx
"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import DocumentPreview from "@/components/DocumentPreview";
import ReviewInterface from "@/components/ReviewInterface";
import ExportButton from "@/components/ExportButton";

export default function Home() {
  const [file, setFile] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleUploadSuccess = ({ parsed, fileName, file }) => {
    setReviewData(parsed);
    setFileName(fileName);
    setFile(file);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FileUpload onUploadSuccess={handleUploadSuccess} />
          {fileName && <span className="text-sm text-gray-600">📄 {fileName}</span>}
        </div>
        <h1 className="text-xl font-bold">Agreement Review System</h1>
      </header>

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Document Preview */}
        <div className="w-1/2 border-r">
          <DocumentPreview file={file} />
        </div>

        {/* Right Panel - Review Interface */}
        <div className="w-1/2">
          <ReviewInterface data={reviewData} />
        </div>
      </div>

      {/* Export Button */}
      <ExportButton />
    </div>
  );
}
```

---

## 7. API Integration

### 7.1 Next.js API Route (Proxy)

```typescript
// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Forward to Python backend
    const response = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();

    // Return only what frontend needs
    return NextResponse.json({
      status: data.status,
      output_parsed: data.output_parsed,
      file_name: data.file_name,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze document" }, { status: 500 });
  }
}
```

### 7.2 Response Structure

```typescript
interface ApiResponse {
  status: "success" | "error";
  file_name: string;
  output_parsed: {
    meta: {
      document_title: string;
      station_or_airport_code: string;
      hotel_name: string;
      airline_name: string;
    };
    review: ReviewField[];
    snippets: Snippet[];
    flags: {
      missing_fields: string[];
      ambiguous_points: string[];
    };
  };
}

interface ReviewField {
  field: string;
  actual_content: string;
  compliant: "Y" | "N";
  comment: string;
}

interface Snippet {
  label: string;
  text: string;
  page_or_section: string;
}
```

---

## 8. Error Handling

### 8.1 Upload Errors

```jsx
const ErrorToast = ({ message, onClose }) => (
  <div className="fixed top-4 right-4 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-lg animate-slide-in">
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-semibold text-red-900">Upload Failed</p>
        <p className="text-sm text-red-700">{message}</p>
      </div>
      <button onClick={onClose}>
        <X className="w-4 h-4 text-red-600" />
      </button>
    </div>
  </div>
);
```

### 8.2 Error Scenarios

| Error             | User Message                                    | Action            |
| ----------------- | ----------------------------------------------- | ----------------- |
| Invalid file type | "Please upload a .docx file"                    | Clear input       |
| File too large    | "File must be under 10MB"                       | Clear input       |
| Backend error     | "Failed to analyze document. Please try again." | Allow retry       |
| Network timeout   | "Request timed out. Check your connection."     | Allow retry       |
| Parse error       | "Could not parse document. Contact support."    | Show support link |

---

## 9. Responsive Design

### 9.1 Desktop (1920px+)

- Full split view (50-50)
- All features visible
- Comfortable reading width

### 9.2 Laptop (1440px)

- Maintain split view
- Slightly narrower panels
- Adjust font sizes

### 9.3 Tablet (768px - 1024px)

- Stack vertically
- Document on top (40% height)
- Review below (60% height)
- Tabs to switch between views

### 9.4 Mobile (< 768px)

- Single column layout
- Tab navigation: "Document" | "Review"
- Simplified card design
- Bottom sheet for details

```jsx
<div className="flex flex-col lg:flex-row h-screen">
  <div className="lg:w-1/2 h-1/2 lg:h-full">
    <DocumentPreview />
  </div>
  <div className="lg:w-1/2 h-1/2 lg:h-full">
    <ReviewInterface />
  </div>
</div>
```

---

## 10. Performance Optimizations

### 10.1 Large Document Handling

```javascript
// Lazy load document sections
const DocumentPreview = ({ file }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 1000 });

  const handleScroll = (e) => {
    // Calculate visible range based on scroll position
    // Only render visible sections
  };

  return <div onScroll={handleScroll}>...</div>;
};
```

### 10.2 Search Debouncing

```javascript
import { useMemo } from "react";
import debounce from "lodash/debounce";

const debouncedSearch = useMemo(() => debounce((term) => setSearchTerm(term), 300), []);
```

### 10.3 Memoization

```javascript
const complianceStats = useMemo(() => {
  const total = reviewData.length;
  const compliant = reviewData.filter((r) => r.compliant === "Y").length;
  return { total, compliant, percentage: (compliant / total) * 100 };
}, [reviewData]);
```

---

## 11. Testing Strategy

### 11.1 Unit Tests

```javascript
// Test file validation
describe("FileUpload", () => {
  it("rejects non-docx files", () => {
    const file = new File(["content"], "test.pdf", { type: "application/pdf" });
    expect(validateFile(file)).toBe(false);
  });

  it("rejects files over 10MB", () => {
    const largeFile = new File(["x".repeat(11 * 1024 * 1024)], "large.docx");
    expect(validateFile(largeFile)).toBe(false);
  });
});

// Test search functionality
describe("Search", () => {
  it("filters by field name", () => {
    const results = filterData(mockData, "Start Date");
    expect(results).toHaveLength(1);
    expect(results[0].field).toBe("Start Date");
  });
});
```

### 11.2 Integration Tests

- Upload flow end-to-end
- API proxy functionality
- Document rendering
- State management

### 11.3 Manual Testing Checklist

- [ ] Upload valid .docx file
- [ ] Upload invalid file type (.pdf, .doc)
- [ ] Upload oversized file (> 10MB)
- [ ] Test all filter combinations (All, Y, N)
- [ ] Test search with various terms
- [ ] Test expand/collapse all functionality
- [ ] Test individual card expand/collapse
- [ ] Verify dynamic field rendering with different agreements
- [ ] Test document zoom controls
- [ ] Test with agreement having 0 non-compliant fields
- [ ] Test with agreement having all non-compliant fields
- [ ] Test with agreement having missing fields
- [ ] Test with agreement having ambiguous points
- [ ] Test responsive design on mobile/tablet/desktop
- [ ] Test with slow network (loading states)
- [ ] Test error scenarios (backend down, timeout, parse error)

---

## 12. Implementation Timeline

### Week 1: Core Setup

**Days 1-2**: Project scaffolding

- [x] Create Next.js project
- [ ] Install dependencies (mammoth, lucide-react)
- [ ] Set up Tailwind CSS
- [ ] Create file structure

**Days 3-5**: Upload & API Integration

- [ ] Build FileUpload component
- [ ] Create API proxy route
- [ ] Implement error handling
- [ ] Test upload flow

### Week 2: Document Preview

**Days 1-3**: Left panel

- [ ] Integrate Mammoth.js
- [ ] Build DocumentPreview component
- [ ] Add zoom controls
- [ ] Style document rendering

**Days 4-5**: Review interface foundation

- [ ] Create ReviewInterface wrapper
- [ ] Build StickyHeader with metadata
- [ ] Implement search bar
- [ ] Add filter buttons

### Week 3: Review Cards

**Days 1-3**: Card implementation

- [ ] Build ReviewCard component
- [ ] Implement expand/collapse logic
- [ ] Add snippet display
- [ ] Style cards with compliance colors

**Days 4-5**: Search & Filter

- [ ] Implement search functionality
- [ ] Add text highlighting
- [ ] Build filter logic
- [ ] Add expand/collapse all

### Week 4: Polish & Launch

**Days 1-2**: UI refinement

- [ ] Add animations and transitions
- [ ] Implement loading states
- [ ] Add error toasts
- [ ] Responsive design

**Days 3-4**: Testing

- [ ] Manual testing all scenarios
- [ ] Fix bugs
- [ ] Performance optimization
- [ ] Browser compatibility

**Day 5**: Deployment

- [ ] Deploy to staging
- [ ] User acceptance testing
- [ ] Deploy to production
- [ ] Documentation

---
