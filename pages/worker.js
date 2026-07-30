export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact" && request.method === "POST") {
      return handleContact(request, env, url);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env, url) {
  const formData = await request.formData();
  const name = (formData.get("name") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim();
  const brand = (formData.get("brand") || "").toString().trim();
  const interest = (formData.get("interest") || "").toString().trim();
  const message = (formData.get("message") || "").toString().trim();

  if (!name || !email || !message) {
    return Response.redirect(new URL("/work-with-me.html?error=1#contact-form", url), 303);
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
    return Response.redirect(new URL("/work-with-me.html?error=1#contact-form", url), 303);
  }

  return Response.redirect(new URL("/work-with-me.html?sent=1#contact-form", url), 303);
}

