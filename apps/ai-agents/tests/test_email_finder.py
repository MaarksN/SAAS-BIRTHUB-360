import pytest
import os
from unittest.mock import AsyncMock, MagicMock, patch
from services.email_finder import EmailPermutator, EmailValidator

def test_permutations():
    permutator = EmailPermutator()
    perms = permutator.generate_permutations("John", "Doe", "company.com")
    assert "john.doe@company.com" in perms
    assert "jdoe@company.com" in perms
    assert len(perms) > 10

@pytest.mark.asyncio
async def test_find_valid_email_success():
    with patch("services.email_finder.dns.resolver.Resolver") as MockResolver:
        # Mock MX Record
        mock_resolver_instance = MockResolver.return_value
        mock_mx = MagicMock()
        mock_mx.exchange = "mail.company.com."
        mock_mx.preference = 10
        mock_resolver_instance.resolve.return_value = [mock_mx]

        # Mock SMTP
        with patch("services.email_finder.aiosmtplib.SMTP") as MockSMTP:
            mock_smtp_instance = MockSMTP.return_value
            mock_smtp_instance.connect = AsyncMock()
            mock_smtp_instance.ehlo = AsyncMock()
            mock_smtp_instance.mail = AsyncMock()

            # Simulate success for one email, failure for others
            async def mock_rcpt(email):
                if email == "john.doe@company.com":
                    return (250, "OK")
                return (550, "User not found")

            mock_smtp_instance.rcpt = AsyncMock(side_effect=mock_rcpt)

            validator = EmailValidator()
            # We must ensure check_catch_all fails (returns False)
            # check_catch_all generates a random email, which will fail our mock_rcpt

            result = await validator.find_valid_email("John", "Doe", "company.com")

            assert result["status"] == "found"
            assert result["email"] == "john.doe@company.com"

@pytest.mark.asyncio
async def test_find_valid_email_catch_all_fallback():
    with patch("services.email_finder.dns.resolver.Resolver") as MockResolver:
        mock_resolver_instance = MockResolver.return_value
        mock_mx = MagicMock()
        mock_mx.exchange = "mail.company.com."
        mock_mx.preference = 10
        mock_resolver_instance.resolve.return_value = [mock_mx]

        with patch("services.email_finder.aiosmtplib.SMTP") as MockSMTP:
            mock_smtp_instance = MockSMTP.return_value
            mock_smtp_instance.connect = AsyncMock()
            mock_smtp_instance.ehlo = AsyncMock()
            mock_smtp_instance.mail = AsyncMock()
            # Everything returns 250 OK -> Catch-all detected
            mock_smtp_instance.rcpt = AsyncMock(return_value=(250, "OK"))

            # Mock Hunter API
            with patch("services.email_finder.httpx.AsyncClient") as MockHTTP:
                mock_client = AsyncMock()
                mock_response = MagicMock()
                mock_response.status_code = 200
                mock_response.json.return_value = {"data": {"email": "catchall@company.com"}}
                mock_client.get.return_value = mock_response
                MockHTTP.return_value.__aenter__.return_value = mock_client

                with patch.dict("os.environ", {"HUNTER_API_KEY": "test_key"}):
                    validator = EmailValidator()
                    result = await validator.find_valid_email("Catch", "All", "company.com")

                    # Should find via Hunter because catch-all was detected
                    assert result["status"] == "found"
                    assert result["email"] == "catchall@company.com"
                    assert result["source"] == "hunter_io_fallback"

@pytest.mark.asyncio
async def test_find_valid_email_smtp_fail_fallback():
    with patch("services.email_finder.dns.resolver.Resolver") as MockResolver:
        mock_resolver_instance = MockResolver.return_value
        mock_mx = MagicMock()
        mock_mx.exchange = "mail.company.com."
        mock_mx.preference = 10
        mock_resolver_instance.resolve.return_value = [mock_mx]

        with patch("services.email_finder.aiosmtplib.SMTP") as MockSMTP:
            mock_smtp_instance = MockSMTP.return_value
            mock_smtp_instance.connect = AsyncMock()
            mock_smtp_instance.ehlo = AsyncMock()
            mock_smtp_instance.mail = AsyncMock()
            # SMTP returns 550 for everything
            mock_smtp_instance.rcpt = AsyncMock(return_value=(550, "User not found"))

            # Mock Hunter API
            with patch("services.email_finder.httpx.AsyncClient") as MockHTTP:
                mock_client = AsyncMock()
                mock_response = MagicMock()
                mock_response.status_code = 200
                mock_response.json.return_value = {"data": {"email": "fallback@company.com"}}
                mock_client.get.return_value = mock_response
                MockHTTP.return_value.__aenter__.return_value = mock_client

                with patch.dict("os.environ", {"HUNTER_API_KEY": "test_key"}):
                    validator = EmailValidator()
                    result = await validator.find_valid_email("Fallback", "User", "company.com")

                    assert result["status"] == "found"
                    assert result["email"] == "fallback@company.com"
                    assert result["source"] == "hunter_io_fallback"
