import { Router, type IRouter } from "express";
import { db, donationsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import {
  CreateDonationBody,
  ListDonationsResponse,
} from "@workspace/api-zod";
import { razorpay } from "../lib/razorpay";
import crypto from "crypto";

const router: IRouter = Router();

router.get("/donations", async (_req, res): Promise<void> => {
  const donations = await db
    .select()
    .from(donationsTable)
    .orderBy(desc(donationsTable.createdAt));

  res.json(
    ListDonationsResponse.parse(
      donations.map((d) => ({
        ...d,
        createdAt: d.createdAt.toISOString(),
      }))
    )
  );
});

router.post("/donations/create-order", async (req, res): Promise<void> => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({
        error: "Invalid amount",
      });
      return;
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // ₹100 -> 10000 paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create order",
    });
  }
});

router.post("/donations/verify-payment", async (req, res): Promise<void> => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
      return;
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
});

router.post("/donations", async (req, res): Promise<void> => {
  const parsed = CreateDonationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [donation] = await db
    .insert(donationsTable)
    .values({
      donorName: parsed.data.donorName,
      type: parsed.data.type,
      amount: parsed.data.amount,
      message: parsed.data.message ?? "",
    })
    .returning();

  res.status(201).json({
    ...donation,
    createdAt: donation.createdAt.toISOString(),
  });
});

export default router;
