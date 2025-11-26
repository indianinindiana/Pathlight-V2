"""
Export Routes
API endpoints for exporting data to various formats.
"""
from fastapi import APIRouter, HTTPException, status, Response
from fastapi.responses import StreamingResponse
import uuid
from datetime import datetime
import logging
import io

from .models import (
    JSONExportRequest,
    CSVExportRequest,
    PDFExportRequest,
    ExportResponse
)
from .service import get_export_service
from ..shared.database import get_database

router = APIRouter(prefix="/export", tags=["Export"])
logger = logging.getLogger(__name__)


# ============================================================================
# Export Endpoints
# ============================================================================

@router.post("/json", response_model=ExportResponse)
async def export_to_json(request: JSONExportRequest):
    """
    Export user data to JSON format.
    
    This endpoint exports profile, debts, and scenarios to a JSON file.
    The JSON can be formatted with indentation for readability.
    
    **Example Request:**
    ```json
    {
      "profile_id": "user123",
      "include_debts": true,
      "include_scenarios": true,
      "include_profile": true,
      "pretty_print": true
    }
    ```
    
    **Example Response:**
    ```json
    {
      "success": true,
      "message": "Data exported successfully to JSON",
      "export_id": "550e8400-e29b-41d4-a716-446655440000",
      "format": "json",
      "file_size_bytes": 2048,
      "created_at": "2025-11-25T19:30:00Z",
      "data": {
        "export_metadata": {...},
        "profile": {...},
        "debts": [...],
        "scenarios": [...]
      }
    }
    ```
    """
    try:
        db = await get_database()
        export_service = get_export_service()
        
        # Fetch profile data
        profile_data = None
        if request.include_profile:
            profile = await db.profiles.find_one({"profile_id": request.profile_id})
            if profile:
                profile.pop("_id", None)
                profile_data = profile
        
        # Fetch debts data
        debts_data = []
        if request.include_debts:
            debts_cursor = db.debts.find({"profile_id": request.profile_id})
            async for debt in debts_cursor:
                debt.pop("_id", None)
                debts_data.append(debt)
        
        # Fetch scenarios data (placeholder - scenarios not yet stored in DB)
        scenarios_data = []
        if request.include_scenarios:
            # TODO: Implement scenario storage and retrieval
            pass
        
        # Export to JSON
        json_str, size_bytes = await export_service.export_to_json(
            profile_data=profile_data,
            debts_data=debts_data,
            scenarios_data=scenarios_data,
            pretty_print=request.pretty_print
        )
        
        # Parse JSON for inline data
        import json
        data = json.loads(json_str)
        
        export_id = str(uuid.uuid4())
        
        return ExportResponse(
            success=True,
            message="Data exported successfully to JSON",
            export_id=export_id,
            format="json",
            file_size_bytes=size_bytes,
            created_at=datetime.utcnow(),
            data=data
        )
        
    except Exception as e:
        logger.error(f"Error exporting to JSON: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export data to JSON: {str(e)}"
        )


@router.post("/csv")
async def export_to_csv(request: CSVExportRequest):
    """
    Export user data to CSV format.
    
    This endpoint exports data to CSV format. You can choose to export:
    - Debts list
    - Scenarios summary
    - Payment schedule from a specific scenario
    
    **Example Request (Export Debts):**
    ```json
    {
      "profile_id": "user123",
      "export_type": "debts"
    }
    ```
    
    **Example Request (Export Payment Schedule):**
    ```json
    {
      "profile_id": "user123",
      "export_type": "payments",
      "scenario_id": "scenario123"
    }
    ```
    
    **Response:**
    Returns a CSV file as a downloadable attachment.
    """
    try:
        db = await get_database()
        export_service = get_export_service()
        
        csv_str = ""
        filename = f"export_{request.export_type}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
        
        if request.export_type == "debts":
            # Fetch debts data
            debts_data = []
            debts_cursor = db.debts.find({"profile_id": request.profile_id})
            async for debt in debts_cursor:
                debt.pop("_id", None)
                debts_data.append(debt)
            
            csv_str, _ = await export_service.export_debts_to_csv(debts_data)
            
        elif request.export_type == "scenarios":
            # Fetch scenarios data (placeholder)
            scenarios_data = []
            # TODO: Implement scenario storage and retrieval
            
            csv_str, _ = await export_service.export_scenarios_to_csv(scenarios_data)
            
        elif request.export_type == "payments":
            if not request.scenario_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="scenario_id is required for payment schedule export"
                )
            
            # Fetch scenario data (placeholder)
            scenario_data = {}
            # TODO: Implement scenario storage and retrieval
            
            csv_str, _ = await export_service.export_payment_schedule_to_csv(scenario_data)
        
        # Return CSV as downloadable file
        return Response(
            content=csv_str,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting to CSV: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export data to CSV: {str(e)}"
        )


@router.post("/pdf")
async def export_to_pdf(request: PDFExportRequest):
    """
    Export user data to PDF format.
    
    This endpoint generates a professional PDF report with:
    - Summary report: Overview of debts and key metrics
    - Detailed report: Complete debt analysis with payment schedules
    - Action plan: Step-by-step debt payoff plan
    
    **Example Request:**
    ```json
    {
      "profile_id": "user123",
      "report_type": "summary",
      "include_charts": true
    }
    ```
    
    **Response:**
    Returns a PDF file as a downloadable attachment.
    
    **Note:** This is a basic implementation. For production, consider using
    libraries like reportlab or weasyprint for professional PDF generation.
    """
    try:
        db = await get_database()
        export_service = get_export_service()
        
        # Fetch profile data
        profile_data = None
        if request.include_profile:
            profile = await db.profiles.find_one({"profile_id": request.profile_id})
            if profile:
                profile.pop("_id", None)
                profile_data = profile
        
        # Fetch debts data
        debts_data = []
        if request.include_debts:
            debts_cursor = db.debts.find({"profile_id": request.profile_id})
            async for debt in debts_cursor:
                debt.pop("_id", None)
                debts_data.append(debt)
        
        # Fetch scenarios data (placeholder)
        scenarios_data = []
        if request.include_scenarios:
            # TODO: Implement scenario storage and retrieval
            pass
        
        # Export to PDF
        pdf_bytes, _ = await export_service.export_to_pdf(
            profile_data=profile_data,
            debts_data=debts_data,
            scenarios_data=scenarios_data,
            report_type=request.report_type,
            scenario_id=request.scenario_id,
            include_charts=request.include_charts
        )
        
        filename = f"debt_report_{request.report_type}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        # Return PDF as downloadable file
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except Exception as e:
        logger.error(f"Error exporting to PDF: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export data to PDF: {str(e)}"
        )