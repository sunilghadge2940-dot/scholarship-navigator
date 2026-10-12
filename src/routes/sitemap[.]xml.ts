import { createFileRoute } from "@tanstack/react-router";
import { getSitemapEntries } from "@/lib/public.functions";

const STATIC = ["/", "/scholarships", "/about", "/contact", "/privacy", "/terms", "/disclaimer"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const rows = await getSitemapEntries();
        const urls = [
          ...STATIC.map((p) => `<url><loc>${origin}${p}</loc></url>`),
          ...rows.map((r) => `<url><loc>${origin}/scholarships/${r.slug}</loc><lastmod>${r.updated_at.slice(0, 10)}</lastmod></url>`),
        ];
        return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
