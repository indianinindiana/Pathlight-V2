"""
Export Service
Business logic for exporting data to various formats.
"""
import json
import csv
import io
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class ExportService:
    """Service for handling data exports"""
    
    def __init__(self):
        """Initialize the export service"""
        pass
    
    async def export_to_json(
        self,
        profile_data: Optional[Dict[str, Any]],
        debts_data: List[Dict[str, Any]],
        scenarios_data: List[Dict[str, Any]],
        pretty_print: bool = True
    ) -> tuple[str, int]:
        """
        Export data to JSON format.
        
        Args:
            profile_data: Profile information
            debts_data: List of debts
            scenarios_data: List of scenarios
            pretty_print: Whether to format JSON with indentation
            
        Returns:
            Tuple of (json_string, size_in_bytes)
        """
        try:
            export_data = {
                "export_metadata": {
                    "export_id": str(uuid.uuid4()),
                    "exported_at": datetime.utcnow().isoformat(),
                    "format": "json",
                    "version": "1.0"
                },
                "profile": profile_data,
                "debts": debts_data,
                "scenarios": scenarios_data
            }
            
            if pretty_print:
                json_str = json.dumps(export_data, indent=2, default=str)
            else:
                json_str = json.dumps(export_data, default=str)
            
            size_bytes = len(json_str.encode('utf-8'))
            
            return json_str, size_bytes
            
        except Exception as e:
            logger.error(f"Error exporting to JSON: {e}")
            raise
    
    async def export_debts_to_csv(
        self,
        debts_data: List[Dict[str, Any]]
    ) -> tuple[str, int]:
        """
        Export debts to CSV format.
        
        Args:
            debts_data: List of debts
            
        Returns:
            Tuple of (csv_string, size_in_bytes)
        """
        try:
            output = io.StringIO()
            
            if not debts_data:
                return "", 0
            
            # Define CSV columns
            fieldnames = [
                "debt_id",
                "name",
                "type",
                "balance",
                "apr",
                "minimum_payment",
                "status",
                "created_at"
            ]
            
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            
            for debt in debts_data:
                row = {
                    "debt_id": debt.get("debt_id", ""),
                    "name": debt.get("name", ""),
                    "type": debt.get("type", ""),
                    "balance": debt.get("balance", 0),
                    "apr": debt.get("apr", 0),
                    "minimum_payment": debt.get("minimum_payment", 0),
                    "status": debt.get("status", "active"),
                    "created_at": debt.get("created_at", "")
                }
                writer.writerow(row)
            
            csv_str = output.getvalue()
            size_bytes = len(csv_str.encode('utf-8'))
            
            return csv_str, size_bytes
            
        except Exception as e:
            logger.error(f"Error exporting debts to CSV: {e}")
            raise
    
    async def export_scenarios_to_csv(
        self,
        scenarios_data: List[Dict[str, Any]]
    ) -> tuple[str, int]:
        """
        Export scenarios to CSV format.
        
        Args:
            scenarios_data: List of scenarios
            
        Returns:
            Tuple of (csv_string, size_in_bytes)
        """
        try:
            output = io.StringIO()
            
            if not scenarios_data:
                return "", 0
            
            # Define CSV columns
            fieldnames = [
                "scenario_id",
                "name",
                "strategy",
                "monthly_payment",
                "total_months",
                "total_interest",
                "total_paid",
                "payoff_date",
                "created_at"
            ]
            
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            
            for scenario in scenarios_data:
                row = {
                    "scenario_id": scenario.get("scenario_id", ""),
                    "name": scenario.get("name", ""),
                    "strategy": scenario.get("strategy", ""),
                    "monthly_payment": scenario.get("monthly_payment", 0),
                    "total_months": scenario.get("total_months", 0),
                    "total_interest": scenario.get("total_interest", 0),
                    "total_paid": scenario.get("total_paid", 0),
                    "payoff_date": scenario.get("payoff_date", ""),
                    "created_at": scenario.get("created_at", "")
                }
                writer.writerow(row)
            
            csv_str = output.getvalue()
            size_bytes = len(csv_str.encode('utf-8'))
            
            return csv_str, size_bytes
            
        except Exception as e:
            logger.error(f"Error exporting scenarios to CSV: {e}")
            raise
    
    async def export_payment_schedule_to_csv(
        self,
        scenario_data: Dict[str, Any]
    ) -> tuple[str, int]:
        """
        Export payment schedule from a scenario to CSV format.
        
        Args:
            scenario_data: Scenario with payment schedule
            
        Returns:
            Tuple of (csv_string, size_in_bytes)
        """
        try:
            output = io.StringIO()
            
            schedule = scenario_data.get("schedule", [])
            if not schedule:
                return "", 0
            
            # Define CSV columns
            fieldnames = [
                "month",
                "payment_date",
                "debt_name",
                "payment",
                "principal",
                "interest",
                "remaining_balance"
            ]
            
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            
            for payment in schedule:
                row = {
                    "month": payment.get("month", 0),
                    "payment_date": payment.get("payment_date", ""),
                    "debt_name": payment.get("debt_name", ""),
                    "payment": payment.get("payment", 0),
                    "principal": payment.get("principal", 0),
                    "interest": payment.get("interest", 0),
                    "remaining_balance": payment.get("remaining_balance", 0)
                }
                writer.writerow(row)
            
            csv_str = output.getvalue()
            size_bytes = len(csv_str.encode('utf-8'))
            
            return csv_str, size_bytes
            
        except Exception as e:
            logger.error(f"Error exporting payment schedule to CSV: {e}")
            raise
    
    async def export_to_pdf(
        self,
        profile_data: Optional[Dict[str, Any]],
        debts_data: List[Dict[str, Any]],
        scenarios_data: List[Dict[str, Any]],
        report_type: str = "summary",
        scenario_id: Optional[str] = None,
        include_charts: bool = True
    ) -> tuple[bytes, int]:
        """
        Export data to PDF format.
        
        Note: This is a placeholder implementation. Full PDF generation
        requires additional libraries like reportlab or weasyprint.
        
        Args:
            profile_data: Profile information
            debts_data: List of debts
            scenarios_data: List of scenarios
            report_type: Type of report (summary, detailed, action_plan)
            scenario_id: Specific scenario to include
            include_charts: Whether to include charts
            
        Returns:
            Tuple of (pdf_bytes, size_in_bytes)
        """
        try:
            # Placeholder: Generate a simple text-based PDF content
            # In production, use reportlab or weasyprint for proper PDF generation
            
            content = f"""
Debt PathFinder Report
Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}
Report Type: {report_type}

{'='*60}

PROFILE INFORMATION
{'='*60}
"""
            
            if profile_data:
                content += f"""
Name: {profile_data.get('name', 'N/A')}
Monthly Income: ${profile_data.get('monthly_income', 0):,.2f}
Goal: {profile_data.get('goal', 'N/A')}
"""
            
            content += f"""

{'='*60}
DEBT SUMMARY
{'='*60}

Total Debts: {len(debts_data)}
"""
            
            if debts_data:
                total_balance = sum(d.get('balance', 0) for d in debts_data)
                total_minimum = sum(d.get('minimum_payment', 0) for d in debts_data)
                
                content += f"""
Total Balance: ${total_balance:,.2f}
Total Minimum Payment: ${total_minimum:,.2f}

Debts:
"""
                for debt in debts_data:
                    content += f"""
  - {debt.get('name', 'Unknown')}
    Balance: ${debt.get('balance', 0):,.2f}
    APR: {debt.get('apr', 0):.2f}%
    Minimum Payment: ${debt.get('minimum_payment', 0):,.2f}
"""
            
            if scenarios_data:
                content += f"""

{'='*60}
SCENARIOS
{'='*60}

Total Scenarios: {len(scenarios_data)}
"""
                for scenario in scenarios_data:
                    content += f"""
  - {scenario.get('name', 'Unknown')}
    Strategy: {scenario.get('strategy', 'N/A')}
    Monthly Payment: ${scenario.get('monthly_payment', 0):,.2f}
    Payoff Time: {scenario.get('total_months', 0)} months
    Total Interest: ${scenario.get('total_interest', 0):,.2f}
"""
            
            content += f"""

{'='*60}
End of Report
{'='*60}
"""
            
            # Convert to bytes (in production, this would be actual PDF bytes)
            pdf_bytes = content.encode('utf-8')
            size_bytes = len(pdf_bytes)
            
            return pdf_bytes, size_bytes
            
        except Exception as e:
            logger.error(f"Error exporting to PDF: {e}")
            raise


# Global service instance
_export_service = ExportService()


def get_export_service() -> ExportService:
    """Get the global export service instance"""
    return _export_service