from playwright.sync_api import Page, expect, sync_playwright
import os

def test_kanban_board(page: Page):
    # Navigate to the deals page
    print("Navigating to dashboard/deals...")
    page.goto("http://localhost:3000/dashboard/deals")

    # Wait for the Kanban board to load
    # Look for the stage columns
    print("Waiting for columns...")
    expect(page.get_by_text("Discovery")).to_be_visible(timeout=10000)
    expect(page.get_by_text("Demo")).to_be_visible()
    expect(page.get_by_text("Negotiation")).to_be_visible()

    # Look for the deal cards
    print("Waiting for cards...")
    expect(page.get_by_text("Acme Corp Expansion")).to_be_visible()
    expect(page.get_by_text("Globex Enterprise License")).to_be_visible()

    # Check if Health Score badge is visible
    # We can check by text "30" or "-20"
    expect(page.get_by_text("30")).to_be_visible()

    # Take a screenshot
    os.makedirs("/home/jules/verification", exist_ok=True)
    print("Taking screenshot...")
    page.screenshot(path="/home/jules/verification/kanban.png", full_page=True)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_kanban_board(page)
            print("Verification script passed!")
        except Exception as e:
            print(f"Verification script failed: {e}")
            page.screenshot(path="/home/jules/verification/kanban-error.png")
        finally:
            browser.close()
