const GEMINI_KEY = "AIzaSyCXZDOA1P2O41LOopi-EGiRfpFDx-LdrtQ";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  if (req.method === "GET") {
    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  try {
    const text = await req.text();
    console.log("Body length:", text.length);
    console.log("Body preview:", text.slice(0, 100));

    if (!text || text.length === 0) {
      return new Response(JSON.stringify({ error: "Empty body" }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const { img, mime } = JSON.parse(text);

    if (!img) {
      return new Response(JSON.stringify({ error: "No image data" }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const body = {
      contents: [{
        parts: [
          { inline_data: { mime_type: mime || "image/jpeg", data: img } },
          { text: 'อ่านสลิปโอนเงินไทยนี้ ตอบ JSON เท่านั้น ห้าม markdown:\n{"amount":<ตัวเลข>,"date":"<YYYY-MM-DD>","note":"<ผู้รับ>","bank":"<แบงค์>","confidence":<0-100>}\nอ่านไม่ได้: {"error":"อ่านไม่ได้"}' },
        ],
      }],
    };

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    );

    const data = await resp.json();
    return new Response(JSON.stringify(data), {
      headers: { ...cors, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
