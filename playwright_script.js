from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        routes = ["/", "/apps/defrag", "/apps/covenant", "/login"]
        for route in routes:
            url = f"http://localhost:3000{route}"
            print(f"Testing {url}...")
            try:
                page.goto(url)
                page.wait_for_load_state('networkidle')
                page.screenshot(path=f"screenshot_{route.replace('/', '_') or 'home'}.png")
                print(f"Successfully captured {route}")
            except Exception as e:
                print(f"Error for {route}: {e}")

        browser.close()

run()
