"use client";

import { useEffect, useState } from "react";
import { ToastContainer } from "@/components/toast";
import type { Toast } from "@/hooks/use-toast";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
}

export default function FaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  let toastId = 0;

  function addToast(message: string, type: "success" | "error" = "success") {
    const id = toastId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }

  function load() {
    fetch("/api/admin/faq")
      .then((res) => res.json())
      .then((d) => { setItems(d); setDirty(false); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!question.trim() || !answer.trim()) return;
    try {
      const res = await fetch("/api/admin/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, sort_order: items.length }),
      });
      if (!res.ok) throw new Error();
      setQuestion(""); setAnswer(""); setShowForm(false);
      addToast("سوال جدید اضافه شد");
      load();
    } catch { addToast("خطا در افزودن", "error"); }
  }

  async function handleDelete(id: number) {
    if (!confirm("آیا از حذف این سوال اطمینان دارید؟")) return;
    try {
      const res = await fetch(`/api/admin/faq?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      addToast("حذف شد");
      load();
    } catch { addToast("خطا در حذف", "error"); }
  }

  async function handleEdit(item: FaqItem) {
    if (!editQuestion.trim() || !editAnswer.trim()) return;
    try {
      const res = await fetch("/api/admin/faq", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, question: editQuestion, answer: editAnswer }),
      });
      if (!res.ok) throw new Error();
      setEditingId(null);
      addToast("ویرایش شد");
      load();
    } catch { addToast("خطا در ویرایش", "error"); }
  }

  function startEdit(item: FaqItem) {
    setEditingId(item.id);
    setEditQuestion(item.question);
    setEditAnswer(item.answer);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function handleDragStart(idx: number) {
    setDragIndex(idx);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) return;
    const reordered = [...items];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(idx, 0, moved);
    setItems(reordered);
    setDragIndex(idx);
    setDirty(true);
  }

  function handleDragEnd() {
    setDragIndex(null);
  }

  async function saveOrder() {
    const orders = items.map((item, i) => ({ id: item.id, sort_order: i }));
    try {
      const res = await fetch("/api/admin/faq", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders }),
      });
      if (!res.ok) throw new Error();
      setDirty(false);
      addToast("ترتیب ذخیره شد");
    } catch { addToast("خطا در ذخیره ترتیب", "error"); }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="size-8 animate-spin rounded-full border-2 border-brand-cta border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-text-primary">سوالات متداول</h1>
        <div className="flex gap-2">
          {dirty && (
            <button type="button" onClick={saveOrder} className="rounded-lg bg-success px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
              ذخیره ترتیب جدید
            </button>
          )}
          <button type="button" onClick={() => setShowForm(!showForm)} className="rounded-lg bg-brand-cta px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
            {showForm ? "انصراف" : "افزودن سوال"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-border bg-bg-surface p-4 flex flex-col gap-3 animate-fade-in">
          <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="سوال" className="rounded-lg border border-border bg-bg-base text-text-primary px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-cta" />
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="پاسخ" rows={3} className="rounded-lg border border-border bg-bg-base text-text-primary px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-cta resize-none" />
          <button type="button" onClick={handleAdd} disabled={!question.trim() || !answer.trim()} className="self-start rounded-lg bg-brand-cta px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50">
            افزودن سوال
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-surface py-16 text-center">
          <p className="text-text-secondary">هیچ سوالی ثبت نشده است</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item, idx) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`rounded-xl border bg-bg-surface p-4 transition-shadow hover:shadow-sm ${dragIndex === idx ? "opacity-50" : ""} ${dragIndex !== null && dragIndex !== idx ? "cursor-grab" : ""}`}
            >
              {editingId === item.id ? (
                <div className="flex flex-col gap-3">
                  <input type="text" value={editQuestion} onChange={(e) => setEditQuestion(e.target.value)} className="rounded-lg border border-border bg-bg-base text-text-primary px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-cta" />
                  <textarea value={editAnswer} onChange={(e) => setEditAnswer(e.target.value)} rows={3} className="rounded-lg border border-border bg-bg-base text-text-primary px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-cta resize-none" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleEdit(item)} disabled={!editQuestion.trim() || !editAnswer.trim()} className="rounded-lg bg-success px-4 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50">
                      ذخیره
                    </button>
                    <button type="button" onClick={cancelEdit} className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-base">
                      انصراف
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <button type="button" onClick={() => startEdit(item)} className="text-right font-bold text-text-primary hover:text-brand-cta transition-colors">
                      {item.question}
                    </button>
                    <p className="mt-1 text-sm text-text-secondary">{item.answer}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button type="button" onClick={() => startEdit(item)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-base">
                      ویرایش
                    </button>
                    <button type="button" onClick={() => handleDelete(item.id)} className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-500 hover:text-white">
                      حذف
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </>
  );
}