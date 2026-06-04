import { NextResponse, type NextRequest } from "next/server";

const ADMIN_GATE_COOKIE = "darion_admin_gate";
const DENIED_REDIRECT_URL = "https://tech.darion.in";
const DENIED_ROASTS = [
  "Nice try hacker. Your keyboard just filed a complaint.",
  "Nice try hacker. Even the firewall yawned.",
  "Nice try hacker. This door requires more than vibes.",
  "Nice try hacker. Your access level is currently potato.",
  "Nice try hacker. The admin panel saw you coming and hid behind the couch.",
  "Nice try hacker. Unauthorized confidence is still unauthorized.",
  "Nice try hacker. The login page said: new phone, who dis?",
  "Nice try hacker. You brought a spoon to a server room.",
  "Nice try hacker. This is not the admin panel you are looking for.",
  "Nice try hacker. Redirecting you to somewhere less spicy."
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
        color-scheme: dark;
        --cyan: #078daf;
        --ink: #08111a;
        --paper: #f8fafc;
      }

      * {
        box-sizing: border-box;
      }

      body {
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        overflow: hidden;
        background:
          radial-gradient(circle at 20% 20%, rgba(7, 141, 175, 0.35), transparent 28rem),
          radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.11), transparent 22rem),
          #05070a;
        color: var(--paper);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .scanline {
        position: fixed;
        inset: 0;
        pointer-events: none;
        background: repeating-linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0.05) 0,
          rgba(255, 255, 255, 0.05) 1px,
          transparent 1px,
          transparent 7px
        );
        animation: drift 8s linear infinite;
        opacity: 0.35;
      }

      .card {
        position: relative;
        width: min(92vw, 560px);
        border: 1px solid rgba(255, 255, 255, 0.22);
        background: rgba(8, 17, 26, 0.82);
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.42);
        padding: 32px;
        text-align: center;
        animation: pop 600ms cubic-bezier(.2,.8,.2,1), floaty 4s ease-in-out infinite;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        border: 1px solid rgba(255, 255, 255, 0.22);
        padding: 8px 12px;
        color: #b8efff;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .logo {
        width: 72px;
        height: 72px;
        margin: 24px auto 14px;
        display: grid;
        place-items: center;
        border: 2px solid rgba(255, 255, 255, 0.9);
        background: var(--cyan);
        color: white;
        font-size: 34px;
        font-weight: 950;
        letter-spacing: -0.08em;
        animation: wobble 1.6s ease-in-out infinite;
      }

      h1 {
        margin: 0;
        font-size: clamp(38px, 9vw, 76px);
        line-height: 0.9;
        text-transform: uppercase;
        letter-spacing: -0.05em;
        text-shadow: 4px 4px 0 rgba(7, 141, 175, 0.75);
      }

      .roast {
        min-height: 56px;
        margin: 22px auto 0;
        max-width: 440px;
        color: #dbeafe;
        font-size: 18px;
        line-height: 1.45;
      }

      .timer {
        margin: 26px auto 0;
        width: 150px;
        height: 150px;
        display: grid;
        place-items: center;
        border: 3px solid rgba(255, 255, 255, 0.24);
        border-radius: 999px;
        background: conic-gradient(var(--cyan) calc(var(--progress, 100) * 1%), rgba(255, 255, 255, 0.1) 0);
        animation: pulse 1s ease-in-out infinite;
      }

      .timer-inner {
        width: 118px;
        height: 118px;
        display: grid;
        place-items: center;
        border-radius: 999px;
        background: #05070a;
      }

      #count {
        font-size: 48px;
        font-weight: 900;
      }

      .redirect {
        margin-top: 18px;
        color: #a8b3c7;
        font-size: 14px;
      }

      .redirect strong {
        color: white;
      }

      .spark {
        position: fixed;
        width: 10px;
        height: 10px;
        background: var(--cyan);
        opacity: 0.55;
        animation: sparkle 5s linear infinite;
      }

      .spark:nth-child(1) { left: 10%; top: 22%; animation-delay: 0s; }
      .spark:nth-child(2) { left: 78%; top: 18%; animation-delay: 800ms; }
      .spark:nth-child(3) { left: 18%; top: 78%; animation-delay: 1300ms; }
      .spark:nth-child(4) { left: 88%; top: 72%; animation-delay: 2100ms; }

      @keyframes pop {
        from { opacity: 0; transform: translateY(20px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes floaty {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }

      @keyframes wobble {
        0%, 100% { transform: rotate(-2deg) scale(1); }
        50% { transform: rotate(2deg) scale(1.06); }
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.035); }
      }

      @keyframes drift {
        from { transform: translateY(0); }
        to { transform: translateY(56px); }
      }

      @keyframes sparkle {
        0% { transform: translateY(0) rotate(0deg); opacity: 0; }
        20% { opacity: 0.7; }
        100% { transform: translateY(-120px) rotate(180deg); opacity: 0; }
      }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 1ms !important;
          animation-iteration-count: 1 !important;
          scroll-behavior: auto !important;
        }
      }
    </style>
  </head>
  <body>
    <div class="scanline"></div>
    <span class="spark"></span>
    <span class="spark"></span>
    <span class="spark"></span>
    <span class="spark"></span>
    <main class="card" role="main" aria-live="polite">
      <div class="badge">Admin gate locked</div>
      <div class="logo">dt.</div>
      <h1>Nice try hacker</h1>
      <p class="roast">${escapeHtml(roast)}</p>
      <div class="timer" id="timer">
        <div class="timer-inner">
          <span id="count">10</span>
        </div>
      </div>
      <p class="redirect">Redirecting to <strong>tech.darion.in</strong> in <span id="countText">10</span> seconds.</p>
    </main>
    <script>
      var seconds = 10;
      var count = document.getElementById("count");
      var countText = document.getElementById("countText");
      var timer = document.getElementById("timer");

      function tick() {
        seconds -= 1;
        count.textContent = String(seconds);
        countText.textContent = String(seconds);
        timer.style.setProperty("--progress", String(seconds * 10));

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
