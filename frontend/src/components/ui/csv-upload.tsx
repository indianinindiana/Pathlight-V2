import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface CSVValidationError {
  row: number;
  field: string;
  message: string;
  type: 'error' | 'warning';
}

export interface CSVUploadProps {
  onUpload: (data: any[]) => void;
  onValidate?: (data: any[]) => CSVValidationError[];
  templateUrl?: string;
  maxFileSize?: number;
  acceptedFormats?: string[];
  className?: string;
}

const CSVUpload: React.FC<CSVUploadProps> = ({
  onUpload,
  onValidate,
  templateUrl,
  maxFileSize = 1024 * 1024,
  acceptedFormats = ['.csv', '.txt'],
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const [errors, setErrors] = useState<CSVValidationError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  }, []);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setFile(file);
    setErrors([]);

    // Simulate file parsing (in real implementation, use papaparse)
    setTimeout(() => {
      const mockData = [
        { name: 'Credit Card A', type: 'credit-card', balance: 5000, apr: 18.99, minimumPayment: 150, nextPaymentDate: '2024-02-01' },
        { name: 'Auto Loan', type: 'auto-loan', balance: 15000, apr: 5.5, minimumPayment: 350, nextPaymentDate: '2024-02-05' }
      ];
      
      setParsedData(mockData);
      
      if (onValidate) {
        const validationErrors = onValidate(mockData);
        setErrors(validationErrors);
      }
      
      setIsProcessing(false);
    }, 1000);
  };

  const handleImport = () => {
    if (parsedData && errors.filter(e => e.type === 'error').length === 0) {
      onUpload(parsedData);
      // Reset state
      setFile(null);
      setParsedData(null);
      setErrors([]);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setParsedData(null);
    setErrors([]);
  };

  const errorCount = errors.filter(e => e.type === 'error').length;
  const warningCount = errors.filter(e => e.type === 'warning').length;

  return (
    <div className={cn('space-y-4', className)}>
      {!parsedData ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-xl p-10 text-center transition-all',
            isDragging
              ? 'border-[#009A8C] bg-[#E7F7F4] border-solid'
              : 'border-[#D4DFE4] bg-[#F7F9FA] hover:border-[#009A8C] hover:bg-[#E7F7F4]'
          )}
        >
          <Upload className="w-12 h-12 text-[#009A8C] mx-auto mb-4" />
          <h3 className="text-base font-semibold text-[#002B45] mb-2">
            Upload CSV File
          </h3>
          <p className="text-sm text-[#4F6A7A] mb-4">
            Drag and drop your file here, or click to browse
          </p>
          
          <label htmlFor="csv-upload">
            <Button
              type="button"
              className="bg-[#009A8C] hover:bg-[#007F74] text-white rounded-lg"
              onClick={() => document.getElementById('csv-upload')?.click()}
            >
              Choose File
            </Button>
          </label>
          <input
            id="csv-upload"
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />

          {templateUrl && (
            <div className="mt-4">
              <a
                href={templateUrl}
                download
                className="text-sm text-[#009A8C] hover:text-[#007F74] underline inline-flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Download CSV template
              </a>
            </div>
          )}

          <div className="mt-4 text-xs text-[#4F6A7A]">
            <p>Accepted formats: {acceptedFormats.join(', ')}</p>
            <p>Maximum file size: {(maxFileSize / 1024 / 1024).toFixed(1)}MB</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Validation Results */}
          <div
            className={cn(
              'p-4 rounded-lg border',
              errorCount > 0
                ? 'bg-red-50 border-red-500'
                : warningCount > 0
                ? 'bg-yellow-50 border-yellow-500'
                : 'bg-green-50 border-green-500'
            )}
          >
            <div className="flex items-start gap-3">
              {errorCount > 0 ? (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              ) : warningCount > 0 ? (
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                {errorCount === 0 && warningCount === 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-green-800">
                      ✓ {parsedData.length} debts found and validated
                    </p>
                    <p className="text-sm text-green-700">
                      ✓ All required fields present
                    </p>
                    <p className="text-sm text-green-700">
                      ✓ No errors detected
                    </p>
                  </div>
                )}
                {errorCount > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-red-800 mb-2">
                      Found {errorCount} error{errorCount !== 1 ? 's' : ''}
                    </p>
                    {errors.filter(e => e.type === 'error').map((error, index) => (
                      <p key={index} className="text-sm text-red-700">
                        ✗ Row {error.row}: {error.message}
                      </p>
                    ))}
                  </div>
                )}
                {warningCount > 0 && errorCount === 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-yellow-800 mb-2">
                      Found {warningCount} warning{warningCount !== 1 ? 's' : ''}
                    </p>
                    {errors.filter(e => e.type === 'warning').map((error, index) => (
                      <p key={index} className="text-sm text-yellow-700">
                        ⚠ Row {error.row}: {error.message}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Table */}
          <div className="border border-[#D4DFE4] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F7F9FA] border-b-2 border-[#D4DFE4]">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#002B45]">
                      Debt Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#002B45]">
                      Type
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#002B45]">
                      Balance
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#002B45]">
                      APR
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#002B45]">
                      Min Payment
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 5).map((row, index) => (
                    <tr key={index} className="border-b border-[#E5E7EB] hover:bg-[#F7F9FA]">
                      <td className="px-4 py-3 text-sm text-[#3A4F61]">{row.name}</td>
                      <td className="px-4 py-3 text-sm text-[#3A4F61]">{row.type}</td>
                      <td className="px-4 py-3 text-sm text-[#3A4F61] text-right">
                        ${row.balance.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#3A4F61] text-right">
                        {row.apr}%
                      </td>
                      <td className="px-4 py-3 text-sm text-[#3A4F61] text-right">
                        ${row.minimumPayment}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedData.length > 5 && (
              <div className="px-4 py-2 bg-[#F7F9FA] text-xs text-[#4F6A7A] text-center">
                Showing 5 of {parsedData.length} debts
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleImport}
              disabled={errorCount > 0}
              className="bg-[#009A8C] hover:bg-[#007F74] text-white rounded-lg"
            >
              Import {parsedData.length} Debt{parsedData.length !== 1 ? 's' : ''}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="border-[#D4DFE4] text-[#3A4F61] rounded-lg"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVUpload;