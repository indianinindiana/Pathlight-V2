import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, CheckCircle2, AlertCircle, Loader2, FileText } from 'lucide-react';
import { importDebtsFromCSV, downloadCSVTemplate } from '@/services/debtApi';
import { getProfileId } from '@/services/sessionManager';
import { showSuccess, showError } from '@/utils/toast';

interface CSVImportDialogProps {
  onImportComplete: () => void;
}

const CSVImportDialog = ({ onImportComplete }: CSVImportDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    success_count: number;
    error_count: number;
    total_rows: number;
    errors: Array<{ row: number; error: string; data: Record<string, string> }>;
    warnings?: Array<{ type: string; message: string; debt_ids: string[] }>;
  } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        showError('Please select a CSV file');
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadCSVTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'debt_import_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess('Template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      showError('Failed to download template');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showError('Please select a file first');
      return;
    }

    const profileId = getProfileId();
    if (!profileId) {
      showError('No profile found. Please complete onboarding first.');
      return;
    }

    setIsUploading(true);
    try {
      const result = await importDebtsFromCSV(selectedFile, profileId);
      setImportResult(result);

      if (result.success_count > 0) {
        showSuccess(`Successfully imported ${result.success_count} debt(s)`);
        onImportComplete();
      }

      if (result.error_count > 0) {
        showError(`${result.error_count} debt(s) failed to import. See details below.`);
      }
    } catch (error) {
      console.error('Error importing CSV:', error);
      showError(error instanceof Error ? error.message : 'Failed to import CSV');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setImportResult(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full md:w-auto border-[#D4DFE4] text-[#002B45] hover:bg-[#F7F9FA] rounded-xl"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload CSV File
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#002B45]">Import Debts from CSV</DialogTitle>
          <DialogDescription className="text-[#3A4F61]">
            Upload a CSV file with your debt information to add multiple debts at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download Template Section */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-1">Need a template?</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Download our CSV template with example data to see the required format
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="space-y-2">
            <label htmlFor="csv-upload" className="block text-sm font-medium text-[#002B45]">
              Select CSV File
            </label>
            <div className="flex gap-2">
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="flex-1 text-sm text-[#3A4F61] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#E7F7F4] file:text-[#009A8C] hover:file:bg-[#D4F0ED] cursor-pointer"
                disabled={isUploading}
              />
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="bg-[#009A8C] hover:bg-[#007F74] text-white"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
            {selectedFile && (
              <p className="text-sm text-[#4F6A7A]">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Import Results */}
          {importResult && (
            <div className="space-y-3">
              <div className="p-4 bg-[#F7F9FA] rounded-lg border border-[#D4DFE4]">
                <h4 className="font-medium text-[#002B45] mb-2">Import Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-[#4F6A7A]">Total Rows</p>
                    <p className="text-lg font-semibold text-[#002B45]">{importResult.total_rows}</p>
                  </div>
                  <div>
                    <p className="text-[#4F6A7A]">Successful</p>
                    <p className="text-lg font-semibold text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {importResult.success_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#4F6A7A]">Failed</p>
                    <p className="text-lg font-semibold text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {importResult.error_count}
                    </p>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {importResult.warnings && importResult.warnings.length > 0 && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <p className="font-medium mb-2">Warnings:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {importResult.warnings.map((warning, idx) => (
                        <li key={idx} className="text-sm">{warning.message}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Errors */}
              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Import Errors:</h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {importResult.errors.map((error, idx) => (
                      <Alert key={idx} className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          <p className="font-medium">Row {error.row}:</p>
                          <p className="text-sm">{error.error}</p>
                          <details className="mt-2">
                            <summary className="text-xs cursor-pointer hover:underline">
                              View row data
                            </summary>
                            <pre className="text-xs mt-1 p-2 bg-red-100 rounded overflow-x-auto">
                              {JSON.stringify(error.data, null, 2)}
                            </pre>
                          </details>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              {/* Success message */}
              {importResult.success_count > 0 && importResult.error_count === 0 && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    All debts imported successfully! You can now close this dialog.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CSVImportDialog;