import asyncio
import dns.resolver
import aiosmtplib
import re
import random
import string
import os
import httpx
from typing import List, Optional, Tuple, Dict
from utils.logger import logger

class EmailPermutator:
    def generate_permutations(self, first_name: str, last_name: str, domain: str) -> List[str]:
        """
        Generates a list of likely corporate email patterns.
        """
        if not first_name or not last_name or not domain:
            return []

        fn = first_name.lower().strip()
        ln = last_name.lower().strip()
        fi = fn[0]
        li = ln[0]
        d = domain.lower().strip()

        permutations = [
            f"{fn}@{d}",                 # john@company.com
            f"{fn}.{ln}@{d}",             # john.doe@company.com
            f"{fn}{ln}@{d}",              # johndoe@company.com
            f"{fi}{ln}@{d}",              # jdoe@company.com
            f"{fi}.{ln}@{d}",             # j.doe@company.com
            f"{fn}{li}@{d}",              # johnd@company.com
            f"{fn}.{li}@{d}",             # john.d@company.com
            f"{fi}{li}@{d}",              # jd@company.com
            f"{ln}.{fn}@{d}",             # doe.john@company.com
            f"{ln}@{d}",                  # doe@company.com
            f"{fn}_{ln}@{d}",             # john_doe@company.com
            f"{fn}-{ln}@{d}",             # john-doe@company.com
            f"{fi}_{ln}@{d}",             # j_doe@company.com
            f"{fi}-{ln}@{d}",             # j-doe@company.com
            f"{ln}{fn}@{d}",              # doejohn@company.com
            f"{ln}.{fi}@{d}",             # doe.j@company.com
        ]
        return list(dict.fromkeys(permutations)) # Remove duplicates

class EmailValidator:
    def __init__(self):
        self.resolver = dns.resolver.Resolver()
        # Set a short timeout for DNS
        self.resolver.lifetime = 5.0

    def get_mx_records(self, domain: str) -> List[str]:
        try:
            records = self.resolver.resolve(domain, 'MX')
            sorted_records = sorted(records, key=lambda r: r.preference)
            return [str(r.exchange).rstrip('.') for r in sorted_records]
        except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.resolver.NoNameservers, Exception) as e:
            logger.warning(f"Failed to get MX records for {domain}: {str(e)}")
            return []

    async def verify_email(self, email: str, mx_server: str) -> Tuple[bool, str]:
        """
        Performs an SMTP handshake to verify existence.
        Returns (is_valid, message).
        """
        try:
            # Connect to the MX server
            client = aiosmtplib.SMTP(hostname=mx_server, port=25, timeout=10)
            await client.connect()

            # HELO
            await client.ehlo("salesos.ai")

            # MAIL FROM
            # Using a generic sender to test availability
            await client.mail("verify@salesos.ai")

            # RCPT TO
            code, message = await client.rcpt(email)

            client.close()

            # 250 means address is valid
            if code == 250:
                return True, "Valid"
            else:
                return False, f"Rejected: {message}"

        except Exception as e:
            return False, f"Connection Error: {str(e)}"

    async def check_catch_all(self, domain: str, mx_server: str) -> bool:
        """
        Checks if the server accepts random addresses (Catch-All).
        """
        random_string = ''.join(random.choices(string.ascii_lowercase + string.digits, k=15))
        random_email = f"{random_string}@{domain}"
        is_valid, _ = await self.verify_email(random_email, mx_server)
        return is_valid

    async def verify_via_hunter(self, first_name: str, last_name: str, domain: str) -> Optional[str]:
        """
        Fallback verification using Hunter.io API.
        """
        api_key = os.getenv("HUNTER_API_KEY")
        if not api_key:
            return None

        url = "https://api.hunter.io/v2/email-finder"
        params = {
            "domain": domain,
            "first_name": first_name,
            "last_name": last_name,
            "api_key": api_key
        }

        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(url, params=params, timeout=10)
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("data") and data["data"].get("email"):
                        return data["data"]["email"]
        except Exception as e:
            logger.error(f"Hunter API error: {str(e)}")
        return None

    async def find_valid_email(self, first_name: str, last_name: str, domain: str) -> Dict:
        """
        Orchestrates the search for a valid email.
        """
        permutator = EmailPermutator()
        candidates = permutator.generate_permutations(first_name, last_name, domain)

        mx_records = self.get_mx_records(domain)
        if not mx_records:
            return {"status": "error", "error": "No MX records found"}

        mx_server = mx_records[0]

        # 1. Check for Catch-All
        is_catch_all = await self.check_catch_all(domain, mx_server)

        # If catch-all, verify directly via Hunter fallback
        if is_catch_all:
             hunter_email = await self.verify_via_hunter(first_name, last_name, domain)
             if hunter_email:
                 return {
                     "status": "found",
                     "email": hunter_email,
                     "confidence": "high",
                     "source": "hunter_io_fallback",
                     "message": "Domain is catch-all; verified via Hunter.io"
                 }

             return {
                 "status": "catch_all_detected",
                 "domain": domain,
                 "candidates": candidates[:5], # Return top likely ones
                 "message": "Domain accepts all emails. Verification not possible via SMTP and Hunter fallback failed/not configured."
             }

        # 2. Validate Candidates
        # We limit concurrency to avoid blocking
        semaphore = asyncio.Semaphore(5)

        found_email = None
        logs = []

        async def check_candidate(email):
            async with semaphore:
                valid, msg = await self.verify_email(email, mx_server)
                return email, valid, msg

        # Use create_task to allow cancellation
        tasks = [asyncio.create_task(check_candidate(email)) for email in candidates]

        # Use as_completed to return early on success
        for future in asyncio.as_completed(tasks):
            try:
                email, valid, msg = await future
                logs.append({"email": email, "valid": valid, "message": msg})

                if valid:
                    found_email = email
                    # Cancel remaining tasks to save resources
                    for t in tasks:
                        if not t.done():
                            t.cancel()
                    break
            except asyncio.CancelledError:
                pass
            except Exception as e:
                logger.error(f"Error checking candidate: {str(e)}")

        if found_email:
            return {"status": "found", "email": found_email, "confidence": "high", "logs": logs, "source": "smtp_handshake"}

        # If not found via SMTP, try Hunter fallback
        hunter_email = await self.verify_via_hunter(first_name, last_name, domain)
        if hunter_email:
             return {
                 "status": "found",
                 "email": hunter_email,
                 "confidence": "high",
                 "source": "hunter_io_fallback",
                 "logs": logs
             }

        return {"status": "not_found", "message": "No valid email confirmed via SMTP or Hunter fallback.", "logs": logs}

email_validator_service = EmailValidator()
