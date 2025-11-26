"""
Export Models
Data models for export functionality.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime


class ExportRequest(BaseModel):
    """Base request model for data export"""
    profile_id: str = Field(..., description="Profile ID to export data for")
    include_debts: bool = Field(default=True, description="Include debt details")
    include_scenarios: bool = Field(default=True, description="Include saved scenarios")
    include_profile: bool = Field(default=True, description="Include profile information")


class JSONExportRequest(ExportRequest):
    """Request model for JSON export"""
    pretty_print: bool = Field(default=True, description="Format JSON with indentation")


class CSVExportRequest(ExportRequest):
    """Request model for CSV export"""
    export_type: Literal["debts", "scenarios", "payments"] = Field(
        default="debts",
        description="Type of data to export to CSV"
    )
    scenario_id: Optional[str] = Field(None, description="Specific scenario ID for payment schedule export")


class PDFExportRequest(ExportRequest):
    """Request model for PDF export"""
    report_type: Literal["summary", "detailed", "action_plan"] = Field(
        default="summary",
        description="Type of PDF report to generate"
    )
    scenario_id: Optional[str] = Field(None, description="Specific scenario to include in report")
    include_charts: bool = Field(default=True, description="Include visual charts in PDF")


class ExportResponse(BaseModel):
    """Response model for export operations"""
    success: bool
    message: str
    export_id: str = Field(..., description="Unique identifier for this export")
    format: Literal["json", "csv", "pdf"]
    file_size_bytes: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    download_url: Optional[str] = Field(None, description="URL to download the exported file")
    data: Optional[dict] = Field(None, description="Inline data for JSON exports")


class ExportMetadata(BaseModel):
    """Metadata about an export"""
    export_id: str
    profile_id: str
    format: str
    created_at: datetime
    file_size_bytes: int
    expires_at: Optional[datetime] = None