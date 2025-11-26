import { API_BASE_URL } from './debtApi';

export type ExportFormat = 'json' | 'csv' | 'pdf';
export type CSVExportType = 'debts' | 'scenarios' | 'payment_schedule';
export type PDFReportType = 'summary' | 'detailed' | 'action_plan';

export interface JSONExportRequest {
  profile_id: string;
  include_debts?: boolean;
  include_scenarios?: boolean;
  include_profile?: boolean;
  pretty_print?: boolean;
}

export interface CSVExportRequest {
  profile_id: string;
  export_type: CSVExportType;
  scenario_id?: string;
}

export interface PDFExportRequest {
  profile_id: string;
  report_type: PDFReportType;
  include_charts?: boolean;
}

export interface ExportResponse {
  success: boolean;
  message: string;
  export_id: string;
  format: ExportFormat;
  file_size_bytes: number;
  created_at: string;
  data?: any;
}

/**
 * Export user data to JSON format
 */
export async function exportToJSON(request: JSONExportRequest): Promise<ExportResponse> {
  const response = await fetch(`${API_BASE_URL}/export/json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to export data to JSON');
  }

  return response.json();
}

/**
 * Export data to CSV format
 */
export async function exportToCSV(request: CSVExportRequest): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/export/csv`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to export data to CSV');
  }

  return response.blob();
}

/**
 * Generate PDF report
 */
export async function exportToPDF(request: PDFExportRequest): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/export/pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to generate PDF report');
  }

  return response.blob();
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Download JSON data as a file
 */
export function downloadJSON(data: any, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  downloadBlob(blob, filename);
}