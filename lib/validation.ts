import { z } from "zod";

const phoneRegex = /^09\d{9}$/;

// Step 1: basic info
export const step1Schema = z.object({
  full_name: z.string().min(1, "نام و نام خانوادگی الزامی است"),
  phone: z
    .string()
    .min(1, "شماره تماس الزامی است")
    .regex(phoneRegex, "شماره تماس معتبر نیست (مثال: 09123456789)"),
  city: z.string().optional().default(""),
});

// Step 2: structured background — every question must be answered (1..4).
const q = () => z.number().int().min(1, "این سوال الزامی است").max(4, "مقدار نامعتبر");
export const step2Schema = z.object({
  sales_experience: q(),
  sales_result: q(),
  leadership: q(),
  network_size: q(),
  availability: q(),
});

// Step 3: motivation + mandatory fit assessment (10 questions, each 1..4).
const fitAnswersSchema = z
  .record(z.string(), z.number().int().min(1).max(4))
  .refine(
    (obj) => Object.keys(obj).length >= 10,
    "لطفاً به تمام ۱۰ سوال ارزیابی تناسب شغلی پاسخ دهید"
  );

export const step3Schema = z.object({
  motivation: z.string().min(1, "انگیزه الزامی است").max(2000),
  fit_answers: fitAnswersSchema,
});

export const referralCodeSchema = z.string().optional().default("");

export const applicantSchema = step1Schema.merge(step2Schema).merge(step3Schema).merge(
  z.object({
    referral_code: referralCodeSchema,
  })
);

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type ApplicantData = z.infer<typeof applicantSchema>;
