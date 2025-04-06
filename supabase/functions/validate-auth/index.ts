import { serve } from "https://deno.land/std@0.140.0/http/server.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  const { email, password } = await req.json();

  if (password) {
    return new Response(
      JSON.stringify({ error: "Password-based login is disabled." }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }

  return new Response(
    JSON.stringify({ message: "Request is valid." }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }
  );
});
