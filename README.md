# Hotel Agreement Review System - POC

Automated compliance review system for hotel-airline rate agreements with AI-powered analysis and interactive UI.

## Overview

This POC focuses on **UI and frontend functionality only**. The backend API will be provided by the backend team. The system allows users to upload DOCX files, view the original document, and review AI-extracted compliance fields in an intuitive split-view interface.

## Features

✅ **File Upload** - Drag & drop or click to upload .docx files (max 10MB)  
✅ **Document Preview** - View original DOCX converted to HTML with zoom controls  
✅ **Review Interface** - Expandable cards showing compliance status for each field  
✅ **Search & Filter** - Real-time search with text highlighting and compliance filters  
✅ **Approve/Reject Workflow** - Approve or reject the review before exporting  
✅ **Export Report** - Download compliance report (enabled only after approval)  
✅ **Collapsible Alerts** - Space-saving collapsible attention required section  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  
✅ **Mock Data** - Built-in mock data for testing without backend  

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Mammoth.js** - DOCX to HTML conversion
- **Lucide React** - Beautiful icons

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in terminal) to view the application.

### 3. Upload and Review a Document

Click "Upload Agreement" and select a `.docx` file. The system will:
1. Validate the file (must be .docx, under 10MB)
2. Convert it to HTML for preview (left panel)
3. Send it to the API for analysis
4. Display compliance review results (right panel)

### 4. Approve and Export

After reviewing the compliance results:
1. Click **"Approve"** button to approve the review
2. Once approved, the **"Export Report"** button becomes enabled
3. Click **"Export Report"** to download the compliance report
4. Click **"Reject"** to reset the approval status

**Note:** Currently using mock data. Set `NEXT_PUBLIC_USE_MOCK_DATA=false` in `.env.local` when backend is ready.

## Project Structure

```
doc-review/
├── app/
│   ├── page.tsx                 # Main page with split view
│   ├── layout.tsx               # Root layout
│   └── api/analyze/route.ts     # API proxy (ready for backend)
├── components/
│   ├── FileUpload.tsx           # Upload button with validation
│   ├── DocumentPreview.tsx      # Left panel - DOCX viewer
│   ├── ReviewInterface.tsx      # Right panel - Review cards
│   ├── ReviewCard.tsx           # Expandable compliance card
│   ├── ComplianceBadge.tsx      # Y/N status badge
│   ├── SearchBar.tsx            # Search input with debounce
│   └── FilterButtons.tsx        # Compliance filters
├── lib/
│   ├── types.ts                 # TypeScript interfaces
│   ├── mockData.ts              # Mock API responses
│   └── utils.ts                 # Helper functions
├── docs/
│   ├── Initial.md               # Original implementation plan
│   ├── POC-Implementation.md    # POC-specific guide
│   └── Progress.md              # Progress tracking
└── .env.local                   # Environment variables
```

## Environment Variables

Create a `.env.local` file:

```bash
# Backend API URL (when ready)
BACKEND_API_URL=http://localhost:8000

# Feature flags
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_MAX_FILE_SIZE_MB=10
```

## API Integration

The `/api/analyze` endpoint is ready for backend integration:

```typescript
// POST /api/analyze
// Request: FormData with 'file' field
// Response: ApiResponse with compliance data
```

When backend is ready:
1. Set `NEXT_PUBLIC_USE_MOCK_DATA=false`
2. Update `BACKEND_API_URL` in `.env.local`
3. Ensure backend returns data matching the `ApiResponse` interface

## Documentation

- **POC Implementation Guide**: `docs/POC-Implementation.md`
- **Progress Tracker**: `docs/Progress.md`
- **Original Plan**: `docs/Initial.md`

## Key Features Explained

### Split View Layout
- **Left Panel**: Document preview with zoom controls (50%-200%)
- **Right Panel**: Compliance review with expandable cards

### Search & Filter
- Search across field names, comments, and content
- Filter by: All, Compliant (Y), Non-Compliant (N)
- Real-time text highlighting
- Debounced input (300ms)

### Review Cards
Each card shows:
- Field name and compliance badge
- Review comment (AI analysis)
- Extracted content
- Full document section (snippet)
- Color-coded borders (green/red)

### File Validation
- Only `.docx` files accepted
- Max size: 10MB
- MIME type validation
- User-friendly error messages

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Next Steps

1. ✅ Core UI implementation complete
2. ⏳ Backend API integration (pending backend team)
3. ⏳ Export functionality (PDF/Excel)
4. ⏳ Manual editing capabilities
5. ⏳ Document highlighting
6. ⏳ Batch processing

## Support

For questions or issues:
- Check `docs/POC-Implementation.md` for detailed implementation guide
- Review `docs/Progress.md` for current status
- Contact development team

---

**Built with Next.js** | **POC Version 1.0** | **Last Updated: 2025-11-06**
