import { randomBytes } from "node:crypto";

export default function handler(request, response) {
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return response.status(500).send("GITHUB_CLIENT_ID yapılandırılmamış.");
  }

  const state = randomBytes(24).toString("hex");
  const redirectUri = "https://www.sutluceemlak.com/api/complete";
  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", "repo,user");
  authorizeUrl.searchParams.set("state", state);

  response.setHeader(
    "Set-Cookie",
    `decap_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  );
  response.redirect(302, authorizeUrl.toString());
}
