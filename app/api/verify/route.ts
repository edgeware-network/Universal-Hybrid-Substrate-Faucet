import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {

  const body = await req.json();
  const { captcha } = body;

  console.log(body);

  if (!captcha) {
    return NextResponse.json({message: "Captcha is required" }, { status: 400 });
  };

  try {
    const res = await axios({
      method: 'POST',
      url: 'https://api.hcaptcha.com/siteverify',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: {
        response: captcha,
        secret: process.env.HCAPTCHA_SECRET_KEY
      }
    });
    const validation = await res.data;
    
    if (validation.success) {
      return NextResponse.json({success: true}, { status: 200 });
    }

  } catch (error: any) {
    return NextResponse.json({message: "Invalid captcha"}, { status: 400 });
  };
};