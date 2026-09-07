export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isPreview = url.hostname.endsWith(".workers.dev");

    if (url.pathname === "/api/contact" && request.method === "POST") {
      return handleContact(request, env, url);
    }

    if (!isPreview && (url.protocol !== "https:" || url.hostname !== "www.queenreen.shop")) {
      url.protocol = "https:";
      url.hostname = "www.queenreen.shop";
      return Response.redirect(url, 308);
    }

    if (request.method === "GET" || request.method === "HEAD") {
      const canonicalPath = getCanonicalPath(url.pathname);

      if (canonicalPath !== url.pathname) {
        url.pathname = canonicalPath;
        return Response.redirect(url, 301);
      }
    }

    const response = await env.ASSETS.fetch(request);

    if (!isPreview) {
      return response;
    }

    const previewResponse = new Response(response.body, response);
    previewResponse.headers.set("X-Robots-Tag", "noindex, nofollow");
    return previewResponse;
  },
};

function getCanonicalPath(pathname) {
  if (pathname === "/index.html") {
    return "/";
  }

  if (pathname.endsWith(".html")) {
    return pathname.slice(0, -5);
  }

  return pathname;
}

const REDIRECT_TARGETS = {
  "/work-with-me": "#contact-form",
  "/partnerships": "#contact",
  "/ugc-portfolio": "#contact",
};

async function handleContact(request, env, url) {
  const formData = await request.formData();
  const name = (formData.get("name") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim();
  const brand = (formData.get("brand") || "").toString().trim();
  const interest = (formData.get("interest") || "").toString().trim();
  const message = (formData.get("message") || "").toString().trim();

  const requestedRedirect = (formData.get("redirect_to") || "").toString().trim();
  const redirectPath = Object.prototype.hasOwnProperty.call(REDIRECT_TARGETS, requestedRedirect)
    ? requestedRedirect
    : "/work-with-me";
  const redirectHash = REDIRECT_TARGETS[redirectPath];

  if (!name || !email || !message) {
    return Response.redirect(new URL(`${redirectPath}?error=1${redirectHash}`, url), 303);
  }

  const bodyLines = [
    `Name: ${name}`,
    `Email: ${email}`,
    brand ? `Brand / Company: ${brand}` : null,
    interest ? `Interested in: ${interest}` : null,
    "",
    message,
  ].filter((line) => line !== null);

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Queen Reen Website <contact@mail.queenreen.shop>",
      to: "hello@queenreen.shop",
      reply_to: email,
      subject: `New inquiry from ${name}`,
      text: bodyLines.join("\n"),
    }),
  });

  if (!resendResponse.ok) {
    return Response.redirect(new URL(`${redirectPath}?error=1${redirectHash}`, url), 303);
  }

  return Response.redirect(new URL(`${redirectPath}?sent=1${redirectHash}`, url), 303);
}
