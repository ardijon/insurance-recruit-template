import { z } from "zod";

const phoneRegex = /^09\d{9}$/;

export const step1Schema = z.object({
  full_name: z.string().min(1, "نام و نام خانوادگی الزامی است"),
  phone: z
    .string()
    .min(1, "شماره تماس الزامی است")
    .regex(phoneRegex, "شماره تماس معتبر نیست (مثال: 09123456789)"),
  city: z.string().optional().default(""),
});

export const step2Schema = z.object({
  sales_background: z.string().max(2000).optional().default(""),
  network_size: z.string().max(1000).optional().default(""),
  availability: z.string().max(1000).optional().default(""),
});

export const step3Schema = z.object({
  motivation: z.string().max(2000).optional().default(""),
});

export const referralCodeSchema = z.string().optional().default("");

const fitAnswersValueSchema = z.record(z.string(), z.number().min(1).max(5));

export const applicantSchema = step1Schema.merge(step2Schema).merge(step3Schema).merge(
  z.object({
    referral_code: referralCodeSchema,
    fit_answers: fitAnswersValueSchema.optional(),
  })
);

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type ApplicantData = z.infer<typeof applicantSchema>;
