import pytest
from unittest.mock import MagicMock, patch
from services.visitor_id import VisitorIDService

@pytest.mark.asyncio
async def test_identify_ip_company():
    with patch("services.visitor_id.IPWhois") as MockIPWhois:
        mock_instance = MockIPWhois.return_value
        mock_instance.lookup_rdap.return_value = {
            "network": {"name": "GOOGLE-CLOUD", "country": "US", "cidr": "8.8.8.0/24"},
            "asn": "15169",
            "asn_description": "GOOGLE"
        }

        service = VisitorIDService()
        result = await service.identify_ip("8.8.8.8")

        assert result["organization"] == "GOOGLE-CLOUD"
        assert result["is_likely_isp"] is False

@pytest.mark.asyncio
async def test_identify_ip_isp():
    with patch("services.visitor_id.IPWhois") as MockIPWhois:
        mock_instance = MockIPWhois.return_value
        mock_instance.lookup_rdap.return_value = {
            "network": {"name": "COMCAST-CABLE", "country": "US", "cidr": "1.2.3.0/24"},
            "asn": "7922",
            "asn_description": "COMCAST-7922"
        }

        service = VisitorIDService()
        result = await service.identify_ip("1.2.3.4")

        assert result["is_likely_isp"] is True
