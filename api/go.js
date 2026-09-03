import { randomInt } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

const listingsDirectory = join(process.cwd(), "src", "ilanlar");
const siteDataPath = join(process.cwd(), "src", "_data", "site.json");

function frontmatterValue(markdown, field) {
  const match = markdown.match(new RegExp(`^${field}:\\s*(.+?)\\s*$`, "m"));
  if (!match) return "";
  const value = match[1].trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) return value.slice(1, -1);
  return value;
}

function normalizePhone(value) {
  const phone = String(value || "").replace(/\D/g, "");
  return /^\d{8,15}$/.test(phone) ? phone : "";
}

export function loadListings() {
  const defaultPhone = normalizePhone(JSON.parse(readFileSync(siteDataPath, "utf8")).phoneRaw);
  const listings = new Map();

  for (const filename of readdirSync(listingsDirectory).filter(name => name.endsWith(".md"))) {
    const markdown = readFileSync(join(listingsDirectory, filename), "utf8");
    const fileSlug = basename(filename, ".md");
    const permalinkSlug = frontmatterValue(markdown, "permalink").match(/^\/ilanlar\/([^/]+)\/?$/)?.[1];
    const redirectSlug = frontmatterValue(markdown, "redirectSlug");
    const phone = normalizePhone(frontmatterValue(markdown, "whatsapp")) || defaultPhone;
    if (!phone) continue;
    const title = frontmatterValue(markdown, "title") || fileSlug;
    const target = {
      slug: fileSlug,
      phone,
      message: frontmatterValue(markdown, "whatsappMessage") || `Merhaba, "${title}" ilanınızla ilgileniyorum.`
    };
    listings.set(fileSlug, target);
    if (permalinkSlug) listings.set(permalinkSlug, target);
    if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(redirectSlug)) listings.set(redirectSlug, target);
  }
  return listings;
}

function queryValue(value, fallback) {
  const first = Array.isArray(value) ? value[0] : value;
  const clean = typeof first === "string" ? first.trim().slice(0, 100) : "";
  return clean || fallback;
}

function clientIdFromCookie(cookieHeader = "") {
  const gaCookie = cookieHeader.split(";").map(part => part.trim()).find(part => part.startsWith("_ga="));
  const match = gaCookie?.match(/_ga=GA\d+\.\d+\.(\d+\.\d+)/);
  return match?.[1] || `${randomInt(1, 2147483647)}.${Math.floor(Date.now() / 1000)}`;
}

export async function sendAnalytics(request, listingSlug, attribution) {
  const measurementId = "G-ZR7SD6J226";
  const apiSecret = "VJVr1ABOT6-yjE6sHghrVw";
  if (!measurementId || !apiSecret) return;
  const endpoint = new URL("https://www.google-analytics.com/mp/collect");
  endpoint.searchParams.set("measurement_id", measurementId);
  endpoint.searchParams.set("api_secret", apiSecret);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 700);
  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        client_id: clientIdFromCookie(request.headers.cookie),
        events: [{ name: "whatsapp_click", params: {
          listing_slug: listingSlug,
          source: attribution.source,
          medium: attribution.medium,
          campaign: attribution.campaign,
          session_id: Math.floor(Date.now() / 1000),
          engagement_time_msec: 1
        } }]
      }),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    return response.status(405).send("Method Not Allowed");
  }
  const listing = loadListings().get(queryValue(request.query.slug, ""));
  if (!listing) return response.status(404).send("İlan bulunamadı.");
  const source = queryValue(request.query.utm_source ?? request.query.source, "direct");
  const medium = queryValue(request.query.utm_medium ?? request.query.medium, source === "google_maps" ? "maps" : "direct");
  const campaign = queryValue(request.query.utm_campaign ?? request.query.campaign, "ilan");
  if (request.method === "GET") {
    try { await sendAnalytics(request, listing.slug, { source, medium, campaign }); } catch { /* Redirect her durumda çalışır. */ }
  }
  const whatsappUrl = new URL(`https://wa.me/${listing.phone}`);
  whatsappUrl.searchParams.set("text", listing.message);
  response.setHeader("Cache-Control", "private, no-store");
  return response.redirect(302, whatsappUrl.toString());
}
