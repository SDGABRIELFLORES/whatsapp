import { useRef } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  accept?: string;
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  className?: string;
}

export default function FileUpload({ 
  accept = "*", 
  onFileSelect, 
  selectedFile, 
  className 
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {selectedFile ? (
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="text-primary h-6 w-6" />
            <div>
              <p className="font-medium text-slate-900">{selectedFile.name}</p>
              <p className="text-sm text-slate-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={removeFile}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "upload-area rounded-lg p-8 text-center cursor-pointer transition-colors",
            "hover:bg-slate-50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="text-primary text-3xl mb-4 mx-auto" />
          <p className="text-slate-600 mb-2">
            Arraste sua planilha aqui ou clique para selecionar
          </p>
          <p className="text-sm text-slate-500">
            Formatos suportados: .xlsx, .xls
          </p>
          <Button 
            type="button"
            className="mt-4 bg-primary text-white hover:bg-primary/90"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Selecionar Arquivo
          </Button>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
