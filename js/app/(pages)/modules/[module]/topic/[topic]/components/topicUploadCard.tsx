'use client';

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileIcon from "@/app/(pages)/modules/[module]/components/fileIcon";
import { DropzoneRootProps, DropzoneInputProps } from 'react-dropzone';

type FileUploadCardProps = {
  files: File[];
  isUploading: boolean;
  uploadError: string | null;
  handleUpload: () => void;
  getRootProps: (props?: DropzoneRootProps) => DropzoneRootProps;
  getInputProps: (props?: DropzoneInputProps) => DropzoneInputProps;
  isDragActive: boolean;
};

export default function TopicUploadCard({
  files,
  isUploading,
  uploadError,
  handleUpload,
  getRootProps,
  getInputProps,
  isDragActive,
}: FileUploadCardProps) {
  return (
    <Card className="max-w-md mx-auto dark:bg-gray-900 dark:text-white">
      <CardContent className="p-6 space-y-4">
        <h2 className="text-xl font-semibold text-center mb-4">
          Upload Topic Material
        </h2>

        {uploadError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            {uploadError}
          </div>
        )}

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20"
              : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50"
          }`}
        >
          <input {...getInputProps()} />
          <FileIcon className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isDragActive
              ? "Drop the file here..."
              : "Drag and drop a PDF here, or click to select one"}
          </p>
          <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">
            Accepted format: PDF (Max 10MB)
          </p>
        </div>

        {files.length > 0 && (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p className="font-medium">Selected file:</p>
            <ul className="list-disc list-inside mt-1">
              {files.map((file) => (
                <li key={file.name}>
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          size="lg"
          className="w-full cursor-pointer"
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </CardFooter>
    </Card>
  );
}