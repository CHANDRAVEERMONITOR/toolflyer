import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ 
        success: false, 
        error: "Razorpay API Keys (ID ya Secret) Vercel Cloud par missing hain! Ek baar dashboard check karein." 
      }, { status: 500 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    
    // Request body ko safely parse karna
    const body = await request.json();
    const { amount, studentId, paymentType } = body;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ success: false, error: "कृपया एक वैध राशि (Amount) दर्ज करें!" }, { status: 400 });
    }

    // Fail-safe check: Agar studentId nahi hai toh crash na ho, ek fallback dummy id lag jaye
    const finalStudentId = studentId || "dummy_id_101";

    const options = {
      amount: Math.round(Number(amount) * 100), // Secure rounding to prevent decimals
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        student_id: String(finalStudentId),
        payment_type: paymentType || "wallet_topup"
      }
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Razorpay Server Order Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Razorpay API Server connection failed!" 
    }, { status: 500 });
  }
}