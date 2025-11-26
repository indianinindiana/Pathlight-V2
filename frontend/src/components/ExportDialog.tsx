import { useState } from 'react';
import { Download, FileJson, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  exportToJSON,
  exportToCSV,
  exportToPDF,
  downloadBlob,
  downloadJSON,
  type ExportFormat,
  type CSVExportType,
  type PDFReportType,
} from '@/services/exportApi';
import { trackEvent } from '@/services/analyticsApi';

interface ExportDialogProps {
  profileId: string;
  trigger?: React.ReactNode;
}

export function ExportDialog({ profileId, trigger }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('json');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // JSON export options
  const [includeDebts, setIncludeDebts] = useState(true);
  const [includeScenarios, setIncludeScenarios] = useState(true);
  const [includeProfile, setIncludeProfile] = useState(true);

  // CSV export options
  const [csvType, setCsvType] = useState<CSVExportType>('debts');

  // PDF export options
  const [pdfType, setPdfType] = useState<PDFReportType>('summary');
  const [includeCharts, setIncludeCharts] = useState(true);

  const handleExport = async () => {
    setLoading(true);
    try {
      if (format === 'json') {
        const response = await exportToJSON({
          profile_id: profileId,
          include_debts: includeDebts,
          include_scenarios: includeScenarios,
          include_profile: includeProfile,
          pretty_print: true,
        });

        if (response.success && response.data) {
          const timestamp = new Date().toISOString().split('T')[0];
          downloadJSON(response.data, `debt-pathfinder-export-${timestamp}.json`);
          
          toast({
            title: 'Export Successful',
            description: `Data exported to JSON (${(response.file_size_bytes / 1024).toFixed(1)} KB)`,
          });
        }
      } else if (format === 'csv') {
        const blob = await exportToCSV({
          profile_id: profileId,
          export_type: csvType,
        });

        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `debt-pathfinder-${csvType}-${timestamp}.csv`;
        downloadBlob(blob, filename);

        toast({
          title: 'Export Successful',
          description: `Data exported to CSV`,
        });
      } else if (format === 'pdf') {
        const blob = await exportToPDF({
          profile_id: profileId,
          report_type: pdfType,
          include_charts: includeCharts,
        });

        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `debt-pathfinder-${pdfType}-report-${timestamp}.pdf`;
        downloadBlob(blob, filename);

        toast({
          title: 'Export Successful',
          description: `${pdfType} report generated`,
        });
      }

      // Track export event
      trackEvent({
        profile_id: profileId,
        event_type: 'data_exported',
        event_data: {
          format,
          ...(format === 'json' && { includeDebts, includeScenarios, includeProfile }),
          ...(format === 'csv' && { csvType }),
          ...(format === 'pdf' && { pdfType, includeCharts }),
        },
      });

      setOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Your Data</DialogTitle>
          <DialogDescription>
            Choose a format and customize what data to export
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex items-center cursor-pointer font-normal">
                  <FileJson className="mr-2 h-4 w-4" />
                  JSON - Complete data export
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center cursor-pointer font-normal">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  CSV - Spreadsheet format
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center cursor-pointer font-normal">
                  <FileText className="mr-2 h-4 w-4" />
                  PDF - Printable report
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* JSON Options */}
          {format === 'json' && (
            <div className="space-y-3 border-t pt-4">
              <Label>Include in Export</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-debts"
                    checked={includeDebts}
                    onCheckedChange={(checked) => setIncludeDebts(checked as boolean)}
                  />
                  <Label htmlFor="include-debts" className="font-normal cursor-pointer">
                    Debts
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-scenarios"
                    checked={includeScenarios}
                    onCheckedChange={(checked) => setIncludeScenarios(checked as boolean)}
                  />
                  <Label htmlFor="include-scenarios" className="font-normal cursor-pointer">
                    Scenarios
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-profile"
                    checked={includeProfile}
                    onCheckedChange={(checked) => setIncludeProfile(checked as boolean)}
                  />
                  <Label htmlFor="include-profile" className="font-normal cursor-pointer">
                    Profile Information
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* CSV Options */}
          {format === 'csv' && (
            <div className="space-y-3 border-t pt-4">
              <Label>CSV Export Type</Label>
              <RadioGroup value={csvType} onValueChange={(v) => setCsvType(v as CSVExportType)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="debts" id="csv-debts" />
                  <Label htmlFor="csv-debts" className="font-normal cursor-pointer">
                    Debts List
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="scenarios" id="csv-scenarios" />
                  <Label htmlFor="csv-scenarios" className="font-normal cursor-pointer">
                    Scenarios Summary
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="payment_schedule" id="csv-schedule" />
                  <Label htmlFor="csv-schedule" className="font-normal cursor-pointer">
                    Payment Schedule
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* PDF Options */}
          {format === 'pdf' && (
            <div className="space-y-3 border-t pt-4">
              <Label>Report Type</Label>
              <RadioGroup value={pdfType} onValueChange={(v) => setPdfType(v as PDFReportType)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="summary" id="pdf-summary" />
                  <Label htmlFor="pdf-summary" className="font-normal cursor-pointer">
                    Summary Report
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="detailed" id="pdf-detailed" />
                  <Label htmlFor="pdf-detailed" className="font-normal cursor-pointer">
                    Detailed Report
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="action_plan" id="pdf-action" />
                  <Label htmlFor="pdf-action" className="font-normal cursor-pointer">
                    Action Plan
                  </Label>
                </div>
              </RadioGroup>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="include-charts"
                  checked={includeCharts}
                  onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                />
                <Label htmlFor="include-charts" className="font-normal cursor-pointer">
                  Include Charts
                </Label>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}