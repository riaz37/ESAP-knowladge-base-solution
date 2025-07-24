# File System Components

This directory contains the components for the File System feature, which allows users to upload files and query from uploaded files.

## Components

### FileSystem.tsx

The main component that orchestrates the file system functionality. It includes:

- Animated toggle between "Upload Files" and "Query Files" modes
- Header with description
- Content switching based on active mode

### AnimatedToggle.tsx

A custom animated toggle component that switches between upload and query modes with smooth animations.

### FileUpload.tsx

Handles file upload functionality with:

- Drag and drop support using react-dropzone
- Support for multiple file types (PDF, DOC, XLS, TXT, Images, Videos, Audio)
- Upload progress simulation
- File list with status indicators
- File removal functionality

### FileQuery.tsx

Handles querying uploaded files with:

- File selection interface
- Query input using the existing QueryInput component
- Loading states with Lottie animations
- Response display with sources
- Query history
- Error handling

## Features

### Upload Mode

- Drag and drop file upload
- Support for multiple file types
- Real-time upload progress
- File status indicators
- File management (remove files)

### Query Mode

- Select files to query from
- Natural language querying
- Quick action suggestions
- Response display with source attribution
- Query history

## Usage

```tsx
import { FileSystem } from "@/components/file-system";

// In your component
<FileSystem theme="dark" />;
```

## File Types Supported

- PDF (.pdf)
- Microsoft Word (.doc, .docx)
- Microsoft Excel (.xls, .xlsx)
- Text files (.txt, .csv)
- Images (.png, .jpg, .jpeg, .gif, .bmp)
- Videos (.mp4, .avi, .mov, .wmv)
- Audio (.mp3, .wav, .flac)

## Dependencies

- react-dropzone: For drag and drop functionality
- lottie-react: For loading animations
- Existing components: QueryInput, PrimaryButton, SecondaryButton
