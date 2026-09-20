# -*- coding: utf-8 -*-
"""Build the client onboarding Word guide (Persian, RTL)."""
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

ACCENT = RGBColor(0x0E, 0x7C, 0x86)  # teal
DARK = RGBColor(0x33, 0x33, 0x33)
GRAY = RGBColor(0x66, 0x66, 0x66)

doc = Document()

# Page + default font
for section in doc.sections:
    section.right_margin = Cm(2)
    section.left_margin = Cm(2)
style = doc.styles["Normal"]
style.font.name = "Vazirmatn"
style.font.size = Pt(12)
style.font.color.rgb = DARK
style.element.rPr.rFonts.set(qn("w:cs"), "Vazirmatn")
style.element.rPr.rFonts.set(qn("w:eastAsia"), "Vazirmatn")


def set_rtl(paragraph):
    pPr = paragraph._p.get_or_add_pPr()
    bidi = OxmlElement("w:bidi")
    bidi.set(qn("w:val"), "1")
    pPr.append(bidi)
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT


def add_heading_fa(text, level=1):
    h = doc.add_heading(level=level)
    run = h.add_run(text)
    run.font.name = "Vazirmatn"
    run.font.color.rgb = ACCENT
    run.font.size = Pt(18 if level == 1 else 15)
    run.element.rPr.rFonts.set(qn("w:cs"), "Vazirmatn")
    set_rtl(h)
    return h


def add_para(text, bold=False, size=12, color=DARK):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.name = "Vazirmatn"
    run.bold = bold
    run.font.size = Pt(size)
    run.font.color.rgb = color
    run.element.rPr.rFonts.set(qn("w:cs"), "Vazirmatn")
    set_rtl(p)
    return p


def add_step(number, title, body_lines, shot_hint):
    add_para(f"قدم {number}: {title}", bold=True, size=13, color=ACCENT)
    for line in body_lines:
        add_para(f"• {line}")
    p = doc.add_paragraph()
    run = p.add_run(f"【اسکرین‌شات: {shot_hint}】")
    run.font.name = "Vazirmatn"
    run.font.size = Pt(11)
    run.font.color.rgb = GRAY
    run.italic = True
    run.element.rPr.rFonts.set(qn("w:cs"), "Vazirmatn")
    set_rtl(p)


# ---- Title ----
t = doc.add_paragraph()
run = t.add_run("راهنمای راه‌اندازی سایت توانا برای مشتری")
run.font.name = "Vazirmatn"
run.font.size = Pt(22)
run.bold = True
run.font.color.rgb = ACCENT
run.element.rPr.rFonts.set(qn("w:cs"), "Vazirmatn")
set_rtl(t)
add_para("شما هیچ کار فنی نمی‌کنید. فقط سه قدم ساده زیر را انجام دهید (حدود ۱۵ دقیقه) و بقیه با ماست.", size=12, color=GRAY)

add_heading_fa("قبل از شروع چه چیزهایی لازم دارید؟", level=2)
add_para("• یک آدرس ایمیل (ترجیحاً جیمیل) که به آن دسترسی دارید")
add_para("• نام دامنه‌ای که می‌خواهید (مثلاً gheshlaghi.ir) — اگر دامنه دارید، همان را بگویید")
add_para("• یک رمز عبور برای پنل مدیریت سایت‌تان (حداقل ۸ کاراکتر)")

add_heading_fa("قدم‌های شما", level=2)

add_step(1, "ساخت اکانت Cloudflare",
         ["وارد سایت dash.cloudflare.com شوید و با ایمیل خودتان ثبت‌نام کنید.",
          "ایمیل تأییدی که از Cloudflare می‌آید را باز کنید و روی لینک تأیید کلیک کنید.",
          "اگر ایمیل را پیدا نکردید، پوشه Spam را هم بررسی کنید."],
         "صفحه ثبت‌نام Cloudflare و ایمیل تأیید")

add_step(2, "ثبت دامنه در Cloudflare",
         ["در داشبورد Cloudflare روی Add Domain کلیک کنید و نام دامنه را بنویسید.",
          "پلن Free را انتخاب کنید.",
          "دو آدرس نیم‌سرور (NS) که Cloudflare می‌دهد را یادداشت کنید؛ مثلاً: kip.ns.cloudflare.com و zara.ns.cloudflare.com"],
         "صفحه‌ای که دو نیم‌سرور kip و zara را نشان می‌دهد")

add_step(3, "تنظیم نیم‌سرورها در IRNIC (فقط دامنه‌های ir.)",
         ["وارد پنل IRNIC شوید (شناسه شما مثل eh21256-irnic).",
          "وارد صفحه دامنه شوید و روی «ویرایش ردیف‌های کارگزاری نام و میزبانی دامنه» کلیک کنید.",
          "فیلدهای ۳ و ۴ را خالی بگذارید و فقط دو نیم‌سرور Cloudflare را وارد کنید.",
          "سؤال امنیتی (Secret Question) را جواب دهید و «ثبت تغییرات» را بزنید.",
          "فعال شدن نیم‌سرورها معمولاً ۱ تا ۲۴ ساعت طول می‌کشد."],
         "پنل IRNIC با دو نیم‌سرور Cloudflare و دکمه ثبت تغییرات")

add_step(4, "ساخت API Token و ارسال برای ما",
         ["در Cloudflare از منوی پروفایل (بالا سمت راست) وارد My Profile شوید.",
          "روی API Tokens کلیک کنید، بعد Create Token و بعد Get started کنار Create Custom Token.",
          "یک نام بنویسید (مثلاً site-deploy) و این دسترسی‌ها را اضافه کنید: Account → Workers Scripts → Edit ،Account → D1 → Edit ،Zone → Workers Routes → Edit ،Zone → DNS → Edit.",
          "در Account Resources اکانت خودتان و در Zone Resources دامنه‌تان را انتخاب کنید.",
          "روی Continue to summary و بعد Create Token بزنید.",
          "توکن را کپی کنید و همراه «نام دامنه» و «رمز ادمین دلخواه» برای ما بفرستید. توجه: توکن فقط یک بار نمایش داده می‌شود."],
         "صفحه ساخت توکن، صفحه دسترسی‌ها، و صفحه خلاصه با دکمه Create Token")

add_heading_fa("بعد از ارسال اطلاعات چه می‌شود؟", level=2)
add_para("• ما سایت شما را نصب و به دامنه وصل می‌کنیم (معمولاً ظرف ۴۸ ساعت کاری).")
add_para("• وقتی آماده شد، پیام «سایتت آماده‌ست» همراه آدرس سایت و آموزش پنل مدیریت برای شما می‌فرستیم.")
add_para("• از آن به بعد فقط وارد پنل مدیریت شوید و اطلاعات‌تان را وارد کنید؛ هیچ کار فنی دیگری لازم نیست.")

add_heading_fa("سؤالات پرتکرار", level=2)
faqs = [
    ("آیا باید چیزی بلد باشم؟", "نه. همین چهار قدم با همین راهنما کافی است و هر جا گیر کردید از ما بپرسید."),
    ("دامنه به نام کی می‌شود؟", "به نام خودتان. ما فقط راه‌اندازی را انجام می‌دهیم؛ مالکیت دامنه همیشه با شماست."),
    ("اگر از قبل دامنه دارم چه؟", "قدم ۳ را رد کنید و فقط توکن را بفرستید؛ دامنه فعلی‌تان را وصل می‌کنیم."),
    ("تمدید سال بعد چقدر است؟", "فقط هزینه تمدید دامنه (تعرفه روز IRNIC) + مبلغ ثابت خدمات که در قرارداد می‌آید."),
    ("توکن را به کسی بدهم امن است؟", "توکن فقط برای نصب سایت شماست و بعد از تحویل می‌توانید آن را از همان صفحه API Tokens حذف (Delete) کنید."),
]
for q, a in faqs:
    add_para(q, bold=True, size=12, color=ACCENT)
    add_para(a)

add_para("ساخته‌شده برای محصول توانا — نسخه ۱.۰", size=11, color=GRAY)

doc.save("D:/New Projects/Insurance/manager-tavana/docs/client-onboarding-guide-fa.docx")
print("saved")
