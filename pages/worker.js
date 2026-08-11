export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact" && request.method === "POST") {
      return handleContact(request, env, url);
    }

    return env.ASSETS.fetch(request);
  },
};

const REDIRECT_TARGETS = {
  "/work-with-me.html": "#contact-form",
  "/partnerships.html": "#contact",
  "/ugc-portfolio.html": "#contact",
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
    : "/work-with-me.html";
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
