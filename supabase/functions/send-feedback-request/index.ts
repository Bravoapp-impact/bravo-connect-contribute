import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find bookings for events that ended ~24h ago (between 20h and 28h ago)
    const now = new Date();
    const windowStart = new Date(now.getTime() - 28 * 60 * 60 * 1000).toISOString();
    const windowEnd = new Date(now.getTime() - 20 * 60 * 60 * 1000).toISOString();

    // Get confirmed bookings for past events in window
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(`
        id,
        user_id,
        experience_date_id,
        experience_dates (
          end_datetime,
          experience_id,
          experiences (
            title,
            association_name
          )
        )
      `)
      .eq("status", "confirmed");

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch bookings" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter bookings in time window
    const eligibleBookings = (bookings || []).filter((b: any) => {
      const endDatetime = b.experience_dates?.end_datetime;
      if (!endDatetime) return false;
      return endDatetime >= windowStart && endDatetime <= windowEnd;
    });

    if (eligibleBookings.length === 0) {
      console.log("No eligible bookings found in window");
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No eligible bookings" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check which bookings already have feedback_request emails
    const bookingIds = eligibleBookings.map((b: any) => b.id);
    const { data: existingLogs } = await supabase
      .from("email_logs")
      .select("booking_id")
      .in("booking_id", bookingIds)
      .eq("email_type", "feedback_request");

    const alreadySent = new Set((existingLogs || []).map((l: any) => l.booking_id));

    // Check which bookings already have reviews
    const { data: existingReviews } = await supabase
      .from("experience_reviews")
      .select("booking_id")
      .in("booking_id", bookingIds);

    const alreadyReviewed = new Set((existingReviews || []).map((r: any) => r.booking_id));

    const toSend = eligibleBookings.filter(
      (b: any) => !alreadySent.has(b.id) && !alreadyReviewed.has(b.id)
    );

    if (toSend.length === 0) {
      console.log("All eligible bookings already processed");
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "All already processed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get profiles for users
    const userIds = [...new Set(toSend.map((b: any) => b.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, first_name")
      .in("id", userIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    let sentCount = 0;

    for (const booking of toSend) {
      const profile = profileMap.get(booking.user_id);
      if (!profile?.email) continue;

      const experienceTitle = (booking as any).experience_dates?.experiences?.title || "l'esperienza";
      const associationName = (booking as any).experience_dates?.experiences?.association_name || "";

      const subject = `Com'è andata con ${associationName || experienceTitle}? 💜`;

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #4F4F4F; max-width: 560px; margin: 0 auto; padding: 20px;">
  <img src="https://cyazgtnjtnyxscfzsasp.supabase.co/storage/v1/object/public/email-assets/bravo-logo-icon.png" alt="Bravo!" height="28" style="margin-bottom: 8px;" />
  <h1 style="color: #373737; margin: 0 0 16px 0; font-size: 22px; font-weight: bold;">Ti va di raccontarci come è andata?</h1>
  
  <p style="margin-bottom: 8px;">Ciao ${profile.first_name || ""},</p>
  <p style="margin-bottom: 24px;">Speriamo che la tua esperienza con <strong>${experienceTitle}</strong> sia stata significativa! Il tuo feedback ci aiuta a migliorare e a creare esperienze ancora più belle.</p>
  
  <a href="https://bravo-experiences.lovable.app/app/bookings" style="display: inline-block; background: #222222; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin-bottom: 24px;">
    Lascia il tuo feedback
  </a>
  
  <p style="margin-top: 24px; color: #999;">Ci vogliono meno di 2 minuti. Grazie! 🙏</p>
  
  <div style="border-top: 1px solid #e5e5e5; padding-top: 16px; margin-top: 32px;">
    <p style="color: #999; margin: 0; font-size: 12px;">
      Questa email è stata inviata automaticamente da Bravo! - La piattaforma per il volontariato aziendale
    </p>
  </div>
</body>
</html>`;

      if (!resendApiKey) {
        console.log(`Would send feedback request to: ${profile.email} for booking ${booking.id}`);
        await supabase.from("email_logs").insert({
          booking_id: booking.id,
          email_type: "feedback_request",
          status: "simulated",
        });
        sentCount++;
        continue;
      }

      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Bravo! <hello@notifications.bravoapp.it>",
            to: [profile.email],
            subject,
            html: emailHtml,
          }),
        });

        const result = await emailResponse.json();

        if (emailResponse.ok) {
          await supabase.from("email_logs").insert({
            booking_id: booking.id,
            email_type: "feedback_request",
            status: "sent",
          });
          sentCount++;
          console.log(`Feedback request sent to ${profile.email}`);
        } else {
          console.error(`Failed to send to ${profile.email}:`, result);
          await supabase.from("email_logs").insert({
            booking_id: booking.id,
            email_type: "feedback_request",
            status: "failed",
          });
        }
      } catch (emailError) {
        console.error(`Error sending to ${profile.email}:`, emailError);
      }
    }

    console.log(`Feedback requests sent: ${sentCount}/${toSend.length}`);
    return new Response(
      JSON.stringify({ success: true, sent: sentCount, total: toSend.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-feedback-request:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
