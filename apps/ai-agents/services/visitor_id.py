from ipwhois import IPWhois
from typing import Dict, Optional
from utils.logger import logger
import asyncio

class VisitorIDService:
    async def identify_ip(self, ip_address: str) -> Dict[str, any]:
        """
        Identifies the organization associated with an IP address using RDAP.
        """
        try:
            # IPWhois performs network calls, so we run it in a thread executor
            loop = asyncio.get_running_loop()

            def lookup():
                obj = IPWhois(ip_address)
                return obj.lookup_rdap(depth=1)

            result = await loop.run_in_executor(None, lookup)

            # Extract relevant info
            network = result.get("network", {})
            asn = result.get("asn", "Unknown")
            asn_desc = result.get("asn_description", "Unknown")
            org = network.get("name", "Unknown")
            country = network.get("country", "Unknown")

            # Simple heuristic to filter ISPs vs Companies
            # This is naive but a starting point. Real implementation needs a large ISP blacklist.
            is_isp = any(isp in (org + asn_desc).lower() for isp in [
                "telecom", "comcast", "verizon", "att", "vodafone", "claro", "vivo", "tim", "oi", "net", "gvt"
            ])

            return {
                "ip": ip_address,
                "organization": org,
                "asn_description": asn_desc,
                "country": country,
                "is_likely_isp": is_isp,
                "raw_data": {
                    "asn": asn,
                    "network_cidr": network.get("cidr")
                }
            }

        except Exception as e:
            logger.error(f"Error identifying IP {ip_address}: {str(e)}")
            return {"error": str(e)}

visitor_id_service = VisitorIDService()
