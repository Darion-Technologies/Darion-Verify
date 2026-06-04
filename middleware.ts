import { NextResponse, type NextRequest } from "next/server";

const ADMIN_GATE_COOKIE = "darion_admin_gate";
const DENIED_REDIRECT_URL = "https://tech.darion.in";
const DENIED_ROASTS = [
  "Nice try hacker. This door requires credentials, not confidence.",
  "Nice try hacker. The admin panel politely declined your enthusiasm.",
  "Nice try hacker. Access denied with corporate professionalism.",
  "Nice try hacker. Unauthorized confidence is still unauthorized.",
  "Nice try hacker. The login page has boundaries.",
  "Nice try hacker. That was brave. Incorrect, but brave.",
  "Nice try hacker. Please bring an access key next time.",
  "Nice try hacker. This shortcut has been sent to compliance.",
  "Nice try hacker. The admin gate is doing its job beautifully.",
  "Nice try hacker. Redirecting you somewhere more appropriate."
];

export function middleware(request: NextRequest) {
  const adminAccessKey = process.env.ADMIN_ACCESS_KEY;

  if (!adminAccessKey) {
    return NextResponse.next();
  }

  const url = request.nextUrl;
  const providedKey = url.searchParams.get("access_key");
  const existingGate = request.cookies.get(ADMIN_GATE_COOKIE)?.value;

  if (existingGate === adminAccessKey) {
    return NextResponse.next();
  }

  if (providedKey === adminAccessKey) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete("access_key");

    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set(ADMIN_GATE_COOKIE, adminAccessKey, {
      httpOnly: true,
      maxAge: 60 * 60 * 8,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production"
    });
    return response;
  }

  return new NextResponse(createDeniedHtml(), {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex, nofollow"
    }
  });
}

export const config = {
  matcher: ["/admin/:path*"]
};

function createDeniedHtml() {
  const roast = DENIED_ROASTS[Math.floor(Math.random() * DENIED_ROASTS.length)];

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,nofollow" />
    <title>Nice Try</title>
    <style>
      :root {
        --cyan: #078daf;
        --ink: #0f172a;
        --muted: #64748b;
        --line: #e2e8f0;
        --paper: #ffffff;
        --soft: #f8fafc;
      }

      * {
        box-sizing: border-box;
      }

      body {
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        background: var(--soft);
        color: var(--ink);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        padding: 24px;
      }

      .card {
        position: relative;
        width: min(100%, 520px);
        border: 1px solid var(--line);
        background: var(--paper);
        box-shadow: 0 18px 48px rgba(15, 23, 42, 0.08);
      }

      .header {
        display: flex;
        align-items: center;
        gap: 14px;
        border-bottom: 1px solid var(--line);
        padding: 22px 24px;
      }

      .logo {
        width: 46px;
        height: 46px;
        display: grid;
        place-items: center;
        border: 1px solid var(--ink);
        background: var(--cyan);
        color: white;
        font-size: 22px;
        font-weight: 950;
        letter-spacing: -0.08em;
      }

      .eyebrow {
        margin: 0;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .brand {
        margin: 3px 0 0;
        font-size: 16px;
        font-weight: 700;
      }

      .content {
        padding: 26px 24px 24px;
      }

      h1 {
        margin: 0;
        font-size: clamp(28px, 6vw, 40px);
        line-height: 1.05;
        letter-spacing: -0.03em;
      }

      .roast {
        min-height: 48px;
        margin: 14px 0 0;
        color: #334155;
        font-size: 16px;
        line-height: 1.45;
      }

      .countdown {
        margin-top: 24px;
        border: 1px solid var(--line);
        background: #f8fafc;
      }

      .countdown-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        padding: 14px 16px;
      }

      .countdown-label {
        margin: 0;
        color: var(--muted);
        font-size: 13px;
      }

      #count {
        min-width: 40px;
        text-align: right;
        color: var(--ink);
        font-size: 30px;
        font-weight: 800;
        line-height: 1;
      }

      .progress {
        height: 3px;
        background: #e2e8f0;
      }

      .bar {
        width: calc(var(--progress, 100) * 1%);
        height: 100%;
        background: var(--cyan);
      }

      .redirect {
        margin: 14px 0 0;
        color: var(--muted);
        font-size: 13px;
      }

      .redirect strong {
        color: var(--ink);
      }

      @media (max-width: 520px) {
        .header,
        .content {
          padding-left: 18px;
          padding-right: 18px;
        }
      }
    </style>
  </head>
  <body>
    <main class="card" role="main" aria-live="polite">
      <header class="header">
        <div class="logo">dt.</div>
        <div>
          <p class="eyebrow">Admin gate locked</p>
          <p class="brand">Darion Badge</p>
        </div>
      </header>
      <section class="content">
        <h1>Nice try hacker.</h1>
        <p class="roast">${escapeHtml(roast)}</p>
        <div class="countdown">
          <div class="countdown-row">
            <p class="countdown-label">Redirecting to tech.darion.in</p>
          <span id="count">10</span>
          </div>
          <div class="progress">
            <div class="bar" id="bar"></div>
          </div>
        </div>
        <p class="redirect">QR verification access requires an authorized admin link.</p>
      </section>
    </main>
    <script>
      var seconds = 10;
      var count = document.getElementById("count");
      var bar = document.getElementById("bar");

      function tick() {
        seconds -= 1;
        count.textContent = String(seconds);
        bar.style.setProperty("--progress", String(seconds * 10));

        if (seconds <= 0) {
          window.location.replace("${DENIED_REDIRECT_URL}");
          return;
        }

        window.setTimeout(tick, 1000);
      }

      window.setTimeout(tick, 1000);
    </script>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
