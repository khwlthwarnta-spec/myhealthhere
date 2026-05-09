import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { db, usersTable, otpCodesTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET ?? "sehatak-secret-change-in-prod";
const JWT_EXPIRES = "30d";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function otpExpiresAt(): Date {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 10);
  return d;
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendOtpEmail(email: string, code: string) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"صحتك أولاً 💙" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `${code} — رمز التحقق من صحتك أولاً`,
    html: `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background: #0f1117; font-family: Arial, sans-serif; }
    .wrapper { max-width: 480px; margin: 40px auto; background: #141820; border-radius: 20px; overflow: hidden; border: 1px solid #1e2533; }
    .header { background: linear-gradient(135deg, #43a876 0%, #2d7a56 100%); padding: 36px 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; letter-spacing: 1px; }
    .header p { color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 13px; }
    .body { padding: 36px 32px; text-align: center; }
    .greeting { color: #e2e8f0; font-size: 15px; margin-bottom: 24px; line-height: 1.6; }
    .otp-label { color: #94a3b8; font-size: 13px; margin-bottom: 12px; }
    .otp-box { display: inline-block; background: #1e2533; border: 2px solid #43a876; border-radius: 16px; padding: 20px 48px; }
    .otp-code { font-size: 42px; font-weight: 900; letter-spacing: 10px; color: #43a876; font-family: 'Courier New', monospace; }
    .expire { color: #64748b; font-size: 12px; margin-top: 24px; }
    .footer { background: #0f1117; padding: 20px 32px; text-align: center; }
    .footer p { color: #475569; font-size: 11px; margin: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>💙 صحتك أولاً</h1>
      <p>التحقق من الهوية</p>
    </div>
    <div class="body">
      <p class="greeting">مرحباً!<br>استخدم الرمز التالي لتأكيد حسابك.</p>
      <p class="otp-label">رمز التحقق</p>
      <div class="otp-box">
        <div class="otp-code">${code}</div>
      </div>
      <p class="expire">⏱ ينتهي صلاحية هذا الرمز خلال <strong>10 دقائق</strong></p>
    </div>
    <div class="footer">
      <p>إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة بأمان.<br>فريق صحتك أولاً</p>
    </div>
  </div>
</body>
</html>`,
  });
}

// POST /api/auth/register
router.post("/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "البريد الإلكتروني غير صالح" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
    }

    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (existing.length > 0 && existing[0].isVerified) {
      return res.status(409).json({ error: "هذا البريد الإلكتروني مسجل مسبقاً" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    if (existing.length > 0) {
      await db
        .update(usersTable)
        .set({ passwordHash })
        .where(eq(usersTable.email, email.toLowerCase()));
    } else {
      await db.insert(usersTable).values({
        email: email.toLowerCase(),
        passwordHash,
        isVerified: false,
      });
    }

    const code = generateOTP();
    await db.insert(otpCodesTable).values({
      email: email.toLowerCase(),
      code,
      expiresAt: otpExpiresAt(),
      used: false,
    });

    await sendOtpEmail(email.toLowerCase(), code);

    return res.status(201).json({ message: "تم إرسال رمز التحقق إلى بريدك الإلكتروني" });
  } catch (err) {
    logger.error(err, "register error");
    return res.status(500).json({ error: "حدث خطأ، يرجى المحاولة لاحقاً" });
  }
});

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" });
    }

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (users.length === 0) {
      return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    }

    if (!user.isVerified) {
      const code = generateOTP();
      await db.insert(otpCodesTable).values({
        email: email.toLowerCase(),
        code,
        expiresAt: otpExpiresAt(),
        used: false,
      });
      await sendOtpEmail(email.toLowerCase(), code);
      return res.status(200).json({ verified: false, message: "يرجى التحقق من بريدك الإلكتروني" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });

    return res.status(200).json({ verified: true, token });
  } catch (err) {
    logger.error(err, "login error");
    return res.status(500).json({ error: "حدث خطأ، يرجى المحاولة لاحقاً" });
  }
});

// POST /api/auth/verify-otp
router.post("/auth/verify-otp", async (req, res) => {
  try {
    const { email, code } = req.body as { email?: string; code?: string };

    if (!email || !code) {
      return res.status(400).json({ error: "البريد الإلكتروني والرمز مطلوبان" });
    }

    const now = new Date();
    const otpRows = await db
      .select()
      .from(otpCodesTable)
      .where(
        and(
          eq(otpCodesTable.email, email.toLowerCase()),
          eq(otpCodesTable.code, code),
          eq(otpCodesTable.used, false),
          gt(otpCodesTable.expiresAt, now),
        ),
      )
      .limit(1);

    if (otpRows.length === 0) {
      return res.status(400).json({ error: "الرمز غير صحيح أو منتهي الصلاحية" });
    }

    await db
      .update(otpCodesTable)
      .set({ used: true })
      .where(eq(otpCodesTable.id, otpRows[0].id));

    await db
      .update(usersTable)
      .set({ isVerified: true })
      .where(eq(usersTable.email, email.toLowerCase()));

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    const token = jwt.sign(
      { id: users[0].id, email: users[0].email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES },
    );

    return res.status(200).json({ token });
  } catch (err) {
    logger.error(err, "verify-otp error");
    return res.status(500).json({ error: "حدث خطأ، يرجى المحاولة لاحقاً" });
  }
});

// POST /api/auth/resend-otp
router.post("/auth/resend-otp", async (req, res) => {
  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      return res.status(400).json({ error: "البريد الإلكتروني مطلوب" });
    }

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (users.length === 0) {
      return res.status(404).json({ error: "البريد الإلكتروني غير موجود" });
    }

    const code = generateOTP();
    await db.insert(otpCodesTable).values({
      email: email.toLowerCase(),
      code,
      expiresAt: otpExpiresAt(),
      used: false,
    });

    await sendOtpEmail(email.toLowerCase(), code);

    return res.status(200).json({ message: "تم إعادة إرسال رمز التحقق" });
  } catch (err) {
    logger.error(err, "resend-otp error");
    return res.status(500).json({ error: "حدث خطأ، يرجى المحاولة لاحقاً" });
  }
});

export default router;
