const cmsOrigin = "https://www.sutluceemlak.com";

function readCookie(request, name) {
  const cookies = request.headers.cookie || "";
  const entry = cookies.split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : "";
}

function resultPage(message) {
  const encodedMessage = JSON.stringify(message);
  const encodedOrigin = JSON.stringify(cmsOrigin);
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>CMS Girişi</title></head><body><p>Giriş tamamlanıyor…</p><script>
    const message = ${encodedMessage};
    const origin = ${encodedOrigin};
    const send = () => window.opener && window.opener.postMessage(message, origin);
    window.addEventListener("message", event => { if (event.origin === origin) send(); });
    if (window.opener) window.opener.postMessage("authorizing:github", origin);
    setTimeout(send, 300);
  </script></body></html>`;
}

export default async function handler(request, response) {
  const { code, state, error } = request.query;
  const savedState = readCookie(request, "decap_oauth_state");

  if (error || !code || !state || !savedState || state !== savedState) {
    return response.status(400).send(resultPage(`authorization:github:error:${JSON.stringify({ message: error || "Geçersiz OAuth isteği" })}`));
  }

  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    return response.status(500).send(resultPage(`authorization:github:error:${JSON.stringify({ message: "GitHub OAuth değişkenleri eksik" })}`));
  }

  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        state,
        redirect_uri: `${cmsOrigin}/api/complete`
      })
    });
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || "GitHub erişim anahtarı alınamadı");
    }

    response.setHeader("Set-Cookie", "decap_oauth_state=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
    return response.status(200).send(resultPage(`authorization:github:success:${JSON.stringify({ token: tokenData.access_token, provider: "github" })}`));
  } catch (oauthError) {
    return response.status(502).send(resultPage(`authorization:github:error:${JSON.stringify({ message: oauthError.message })}`));
  }
}
