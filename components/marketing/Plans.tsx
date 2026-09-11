"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";
import {
  formatPlanPrice,
  getPlansByCategory,
  planCategories,
  type PlanCategoryId,
} from "@/lib/plans";

export function Plans() {
  const [categoryId, setCategoryId] = useState<PlanCategoryId>("standard");

  return (
    <section id="plans" className="bg-cream-deep py-20 text-ink md:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sage-deep">
            Meal plans
          </p>
          <h2 className="mt-3 font-display text-4xl leading-tight font-medium tracking-tight sm:text-5xl">
            Choose the Plan That Works for You
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink/65">
            Start with Standard or High-Protein, then subscribe for a week or a
            month and pay directly on the website.
          </p>
        </div>

        <div
          className="mx-auto mt-10 flex max-w-md rounded-full bg-ink/5 p-1"
          role="tablist"
          aria-label="Plan category"
        >
          {planCategories.map((item) => {
            const selected = item.id === categoryId;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`plans-${item.id}`}
                onClick={() => setCategoryId(item.id)}
                className={`min-h-11 flex-1 cursor-pointer rounded-full px-4 text-sm font-semibold transition-colors ${
                  selected
                    ? "bg-ink text-cream"
                    : "text-ink/65 hover:text-ink"
                }`}
              >
                {item.eyebrow}
              </button>
            );
          })}
        </div>

        {planCategories.map((category) => {
          const selected = category.id === categoryId;
          const plans = getPlansByCategory(category.id);

          return (
            <div
              key={category.id}
              id={`plans-${category.id}`}
              role="tabpanel"
              hidden={!selected}
              className={selected ? "mt-8" : undefined}
            >
              <div className="mx-auto max-w-2xl text-center">
                <h3 className="font-display text-2xl font-medium tracking-tight">
                  {category.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/65">
                  {category.description}
                </p>
              </div>

              <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {plans.map((plan) => (
                  <article
                    key={plan.id}
                    className="flex flex-col rounded-4xl border border-ink/8 bg-white p-6 shadow-[0_16px_40px_rgba(12,12,12,0.05)]"
                  >
                    <h4 className="font-display text-2xl font-medium tracking-tight">
                      {plan.shortName}
                    </h4>

                    <div className="mt-4 space-y-1">
                      <p className="flex items-baseline gap-2">
                        <span className="font-display text-3xl font-medium tracking-tight">
                          {formatPlanPrice(plan.monthlyPrice, plan.currency)}
                        </span>
                        <span className="text-sm text-ink/45">/ month</span>
                      </p>
                      <p className="text-sm text-ink/55">
                        {formatPlanPrice(plan.weeklyPrice, plan.currency)} /
                        week
                      </p>
                    </div>

                    <ul className="mt-5 space-y-2.5 text-sm text-ink/75">
                      <li>
                        {plan.mealsPerMonth} meals / month ·{" "}
                        {plan.mealsPerWeek} meals / week
                      </li>
                      <li>{plan.includes}</li>
                      <li>
                        {plan.daysPerWeek} days a week · {plan.daysTotal} days
                        total
                      </li>
                    </ul>

                    <ButtonLink
                      href={`/subscribe/${plan.id}`}
                      variant="solid"
                      className="mt-6 w-full"
                    >
                      Subscribe
                    </ButtonLink>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </Container>
    </section>
  );
}
