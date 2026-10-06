import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z
  .object({
    /** data URL: data:<mime>;base64,<...> */
    dataUrl: z.string().min(32).optional(),
    /** plain text extracted client-side (docx, txt) */
    text: z.string().min(1).optional(),
    filename: z.string().optional(),
  })
  .refine((v) => !!v.dataUrl || !!v.text, "Nothing to read");

export type ExtractedDoc = {
  merchant: string;
  amount: number;
  currency: string;
  date: string;
  category: string;
  taxId: string | null;
  vat: number | null;
  invoiceNumber: string | null;
  pages: number;
  lineItems: { label: string; amount: number }[];
  summary: string;
  confidence: number;
  raw: string;
};

const SYSTEM = `You are a document-reading engine for an accounting app.
Read the attached invoice / receipt / fiscal document carefully and extract the real values that appear on it.
Never invent data: if a field is genuinely absent, use null (or an empty array).
Respond with STRICT JSON only, no markdown fence, matching:
{
  "merchant": string,
  "amount": number,            // grand total, numeric only
  "currency": string,          // e.g. "DZD", "EUR", "USD"
  "date": string,              // as printed, e.g. "20 Mar 2026"
  "category": string,          // one of: Invoice, Receipt, Utilities, Transport, Supplies, Services, Other
  "taxId": string|null,        // NIF / VAT / tax number if printed
  "vat": number|null,          // tax amount if printed
  "invoiceNumber": string|null,
  "pages": number,
  "lineItems": [{"label": string, "amount": number}],
  "summary": string,           // one sentence describing what this document is
  "confidence": number,        // 0-1, how sure you are of the reading
  "raw": string                // the main text you could read, max 900 chars
}`;

function contentBlock(dataUrl: string, filename?: string) {
  const mime = dataUrl.slice(5, dataUrl.indexOf(";"));
  if (mime === "application/pdf") {
    return {
      type: "file" as const,
      file: { filename: filename ?? "document.pdf", file_data: dataUrl },
    };
  }
  return { type: "image_url" as const, image_url: { url: dataUrl } };
}

export const readDocument = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }): Promise<ExtractedDoc> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured for this project.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3.7-flash",
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: data.text
                  ? `Read this document text and return the JSON described above.\n\n---\n${data.text.slice(0, 20000)}`
                  : "Read this document and return the JSON described above.",
              },
              ...(data.dataUrl ? [contentBlock(data.dataUrl, data.filename)] : []),
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("Too many scans right now — try again in a moment.");
      if (res.status === 402) throw new Error("AI credits are exhausted for this workspace.");
      throw new Error(`Document reading failed [${res.status}]: ${body.slice(0, 300)}`);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = json.choices?.[0]?.message?.content ?? "";
    const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start < 0 || end < 0) throw new Error("Could not read this document.");

    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Partial<ExtractedDoc>;
    return {
      merchant: parsed.merchant?.toString().trim() || "Unknown merchant",
      amount: Number(parsed.amount) || 0,
      currency: parsed.currency?.toString() || "DZD",
      date: parsed.date?.toString() || "—",
      category: parsed.category?.toString() || "Other",
      taxId: parsed.taxId ?? null,
      vat: parsed.vat == null ? null : Number(parsed.vat),
      invoiceNumber: parsed.invoiceNumber ?? null,
      pages: Number(parsed.pages) || 1,
      lineItems: Array.isArray(parsed.lineItems)
        ? parsed.lineItems
            .slice(0, 8)
            .map((l) => ({ label: String(l?.label ?? ""), amount: Number(l?.amount) || 0 }))
        : [],
      summary: parsed.summary?.toString() || "",
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.7)),
      raw: (parsed.raw?.toString() ?? "").slice(0, 900),
    };
  });
