"use client";

import { useState } from "react";
import { faqs } from "@/lib/faq";

export function FaqList() {
  const [openId, setOpenId] = useState<number | null>(0);

  return (
    <div className="divide-y divide-ink/10 rounded-[2rem] border border-ink/8 bg-white">
      {faqs.map((item, index) => {
        const open = openId === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : index)}
            >
              <span className="text-base font-semibold tracking-tight text-ink">
                {item.question}
              </span>
              <span className="text-sage-deep" aria-hidden>
                {open ? "−" : "+"}
              </span>
            </button>
            {open ? (
              <p className="px-6 pb-5 text-sm leading-relaxed text-ink/65">
                {item.answer}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
