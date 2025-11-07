# Multi-File Batch Upload Feature

## Overview
The Hotel Agreement Review System now supports uploading and analyzing multiple documents simultaneously with an intuitive tabbed interface.

## Features

### 1. **Batch Upload**
- Upload multiple `.docx` files at once
- Drag & drop support for multiple files
- File input accepts multiple selections
- Validates all files before upload

### 2. **File Tabs Navigation**
- **Tab Interface**: Each uploaded file gets its own tab
- **Active Indicator**: Current file highlighted with blue styling
- **Compliance Preview**: Shows compliant/total count per file
- **Navigation Arrows**: Previous/Next buttons for easy switching
- **File Counter**: Shows current position (e.g., "2 / 5")
- **Remove Files**: X button to remove individual files
- **Horizontal Scroll**: Smooth scrolling for many files

### 3. **Seamless Switching**
- Click any tab to switch files instantly
- All features work per-file:
  - Document preview
  - Compliance review
  - Approve/Reject status
  - Text highlighting
  - Export functionality

## API Integration

### Endpoint
```
POST /api/analyze-batch
```

### Request
```typescript
FormData with multiple files:
- files: File[] (multiple .docx files)
```

### Response
```json
{
  "status": "success",
  "results": [
    {
      "status": "success",
      "run_id": "690db3e337a5e2c1f4a0bdaa",
      "file_name": "Hotel-Airline Rate Agreement - Sample B.docx",
      "output_raw": "...",
      "output_parsed": {
        "meta": {...},
        "review": [...],
        "snippets": [...],
        "flags": {...}
      }
    }
  ]
}
```

## UI Components

### FileTabs Component
- **Location**: `/components/FileTabs.tsx`
- **Props**:
  - `files`: Array of FileData
  - `activeIndex`: Currently selected file index
  - `onSelectFile`: Callback when tab is clicked
  - `onRemoveFile`: Callback when X is clicked

### Updated Components
1. **FileUpload**: Now handles multiple files
2. **Main Page**: Manages file array and active index
3. **DocumentPreview**: Switches document based on active file
4. **ReviewInterface**: Shows review for active file

## User Flow

1. **Upload**: Click "Upload Agreements" and select multiple files
2. **View Tabs**: See all uploaded files in tab bar
3. **Navigate**: Click tabs or use arrow buttons to switch
4. **Review**: Each file maintains its own state
5. **Remove**: Click X on any tab to remove that file
6. **Export**: Export works for the currently active file

## Styling

### Tab States
- **Active**: Blue background, blue border, shadow
- **Inactive**: Gray background, gray border
- **Hover**: Lighter background on inactive tabs

### Visual Indicators
- 📄 File icon for each tab
- Compliance count badge
- File counter (e.g., "1 / 3")
- Smooth transitions and hover effects

## Technical Details

### State Management
```typescript
const [filesData, setFilesData] = useState<FileData[]>([]);
const [activeFileIndex, setActiveFileIndex] = useState(0);
```

### File Data Structure
```typescript
interface FileData {
  file: File;           // Original File object
  fileName: string;     // Display name
  parsed: OutputParsed; // API response
  runId: string;        // Unique identifier
}
```

## Benefits

✅ **Efficiency**: Analyze multiple agreements at once
✅ **Organization**: Easy file management with tabs
✅ **Context**: Quick switching without re-upload
✅ **Flexibility**: Remove unwanted files anytime
✅ **UX**: Intuitive navigation with visual feedback

## Future Enhancements

- Bulk approve/reject across all files
- Batch export to single Excel file
- File comparison view
- Drag-to-reorder tabs
- Persistent file history
