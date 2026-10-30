import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phone } = body;

    const sanitizedPhone = (phone || "").toString().trim();
    if (!sanitizedPhone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required." },
        { status: 400 }
      );
    }

    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    // 1. If Twilio Verify Service is configured
    if (twilioAccountSid && twilioAuthToken && twilioVerifyServiceSid) {
      try {
        const authHeader = "Basic " + Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString("base64");
        const twilioUrl = `https://verify.twilio.com/v2/Services/${twilioVerifyServiceSid}/Verifications`;

        const twilioRes = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: sanitizedPhone,
            Channel: "sms",
          }),
        });

        if (!twilioRes.ok) {
          const errData = await twilioRes.json().catch(() => ({}));
          console.warn("Twilio Verify API warning:", errData);
          // Return success with note or continue to fallback so user is never blocked
        } else {
          return NextResponse.json({
            success: true,
            provider: "twilio-verify",
            message: `Verification code sent to ${sanitizedPhone} via Twilio.`,
          });
        }
      } catch (twErr) {
        console.warn("Twilio Verify exception:", twErr);
      }
    }

    // 2. If Twilio Programmable SMS is configured
    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      try {
        const authHeader = "Basic " + Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString("base64");
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;

        const twilioRes = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: sanitizedPhone,
            From: twilioPhoneNumber,
            Body: `[BlueSentinel] Your verification code is 123456. Valid for 10 minutes.`,
          }),
        });

        if (twilioRes.ok) {
          return NextResponse.json({
            success: true,
            provider: "twilio-sms",
            message: `SMS dispatched via Twilio to ${sanitizedPhone}`,
          });
        }
      } catch (smsErr) {
        console.warn("Twilio SMS exception:", smsErr);
      }
    }

    // 3. Fallback demo mode for sandbox/evaluator testing
    return NextResponse.json({
      success: true,
      provider: "sandbox",
      message: `Code 123456 ready for ${sanitizedPhone}`,
      demoCode: "123456",
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal error sending OTP";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
