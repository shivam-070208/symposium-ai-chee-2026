"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Mail,
  Send,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/server/validation/contact.schema";

const nextSteps = [
  {
    id: "01",
    label: "YOUR QUERY IS RECORDED",
    text: "The message is saved and listed in the organisers' query inbox right away.",
  },
  {
    id: "02",
    label: "CONFIRMATION EMAIL",
    text: "You receive an email confirming that your query has reached us.",
  },
  {
    id: "03",
    label: "REPLY FROM THE COMMITTEE",
    text: "The organising committee reads your query and replies to your email.",
  },
];

const INPUT_CLASS =
  "mt-2 h-[44px] w-full rounded-lg border border-line bg-white px-3 text-[14px] text-navy outline-none transition-colors placeholder:text-mist focus:border-royal focus:ring-2 focus:ring-royal/15 aria-[invalid=true]:border-errorred";

const TEXTAREA_CLASS =
  "mt-2 w-full min-h-[150px] rounded-lg border border-line bg-white px-3 py-2.5 text-[14px] leading-6 text-navy outline-none transition-colors placeholder:text-mist focus:border-royal focus:ring-2 focus:ring-royal/15 aria-[invalid=true]:border-errorred";

const LABEL_CLASS = "text-[14px] font-medium text-navy";

const DEFAULT_VALUES: ContactFormValues = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export const ContactSection = () => {
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  });
  const createQuery = trpc.contact.create.useMutation();

  const {
    register,
    formState: { errors },
    reset,
  } = form;

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await form.handleSubmit(async (values) => {
      try {
        await createQuery.mutateAsync(values);
        setSentTo(values.email);
        reset();
      } catch {
        // The mutation error message renders next to the submit button.
      }
    })(event);
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-paper px-5 py-20 text-navy sm:px-8 sm:py-24 lg:px-12 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-12 max-w-3xl sm:mb-16"
        >
          <div className="mb-5 inline-flex items-center gap-2 border border-line bg-white px-4 py-2 text-[10px] font-semibold tracking-[0.2em] text-royal sm:text-xs">
            <Mail size={15} strokeWidth={1.8} />
            <span>CONTACT US</span>
          </div>

          <h2 className="text-3xl font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-4xl lg:text-6xl">
            Have a question for us?
            <span className="mt-1 block font-serif font-normal italic text-royal">
              Send us a query.
            </span>
          </h2>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-bodytext sm:text-base sm:leading-8">
            Reach the organising committee of AI-CHHE 2026 about registration,
            abstract submission, fees, or visiting NIT Patna. You will get a
            confirmation email the moment your query is submitted.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.article
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="border border-line bg-white p-6 sm:p-8"
          >
            {sentTo ? (
              <div className="flex h-full flex-col items-start justify-center py-6 text-left">
                <span className="flex size-12 items-center justify-center rounded-full bg-ice">
                  <CheckCircle2 className="size-6 text-success" strokeWidth={1.8} />
                </span>

                <h3 className="mt-5 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
                  Query received
                </h3>

                <p className="mt-3 max-w-md text-sm leading-7 text-bodytext">
                  We have received your query and will contact you soon. A
                  confirmation has been sent to{" "}
                  <span className="font-medium text-navy">{sentTo}</span>.
                </p>

                <button
                  type="button"
                  onClick={() => setSentTo(null)}
                  className="mt-7 inline-flex items-center gap-3 border border-line px-5 py-3 text-sm font-medium text-navy transition-colors duration-300 hover:border-royal hover:text-royal"
                >
                  Send another query
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <form onSubmit={submitContact} noValidate>
                <p className="text-xs font-semibold tracking-[0.18em] text-mist">
                  SEND A QUERY
                </p>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className={LABEL_CLASS}>
                      Your Name{" "}
                      <span aria-hidden="true" className="text-errorred">
                        *
                      </span>
                    </label>
                    <input
                      id="contact-name"
                      autoComplete="name"
                      placeholder="Enter your name"
                      aria-invalid={Boolean(errors.name)}
                      className={INPUT_CLASS}
                      {...register("name")}
                    />
                    {errors.name ? (
                      <p role="alert" className="mt-1.5 text-[12px] text-errorred">
                        {errors.name.message}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="contact-email" className={LABEL_CLASS}>
                      Email Address{" "}
                      <span aria-hidden="true" className="text-errorred">
                        *
                      </span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email address"
                      aria-invalid={Boolean(errors.email)}
                      className={INPUT_CLASS}
                      {...register("email")}
                    />
                    {errors.email ? (
                      <p role="alert" className="mt-1.5 text-[12px] text-errorred">
                        {errors.email.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="contact-subject" className={LABEL_CLASS}>
                      Subject{" "}
                      <span aria-hidden="true" className="text-errorred">
                        *
                      </span>
                    </label>
                    <input
                      id="contact-subject"
                      placeholder="What is your query about?"
                      aria-invalid={Boolean(errors.subject)}
                      className={INPUT_CLASS}
                      {...register("subject")}
                    />
                    {errors.subject ? (
                      <p role="alert" className="mt-1.5 text-[12px] text-errorred">
                        {errors.subject.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="contact-message" className={LABEL_CLASS}>
                      Message{" "}
                      <span aria-hidden="true" className="text-errorred">
                        *
                      </span>
                    </label>
                    <textarea
                      id="contact-message"
                      rows={6}
                      placeholder="Write your query in detail…"
                      aria-invalid={Boolean(errors.message)}
                      className={TEXTAREA_CLASS}
                      {...register("message")}
                    />
                    {errors.message ? (
                      <p role="alert" className="mt-1.5 text-[12px] text-errorred">
                        {errors.message.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-7 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-sm text-[13px] leading-6 text-mist">
                    Your details are used only to answer this query.
                  </p>

                  <button
                    type="submit"
                    disabled={createQuery.isPending}
                    className="inline-flex items-center justify-center gap-3 border border-royal bg-royal px-6 py-3.5 text-sm font-medium text-white transition-colors duration-300 hover:border-navy hover:bg-navy disabled:pointer-events-none disabled:opacity-60"
                  >
                    {createQuery.isPending ? (
                      <>
                        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                        Sending…
                      </>
                    ) : (
                      <>
                        Send query
                        <Send size={16} />
                      </>
                    )}
                  </button>
                </div>

                {createQuery.isError ? (
                  <p
                    role="alert"
                    className="mt-4 rounded-lg border border-errorred/20 bg-errorred/5 px-3 py-2 text-[13px] text-errorred"
                  >
                    {createQuery.error.message}
                  </p>
                ) : null}
              </form>
            )}
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="flex flex-col border border-line bg-white p-6 sm:p-8"
          >
            <div className="flex items-center gap-3">
              <Mail size={20} strokeWidth={1.7} className="text-royal" />
              <p className="text-xs font-semibold tracking-[0.18em] text-mist">
                WHAT HAPPENS NEXT
              </p>
            </div>

            <h3 className="mt-6 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
              Your query reaches us.
            </h3>

            <div className="mt-7 border-t border-line">
              {nextSteps.map((step) => (
                <div
                  key={step.id}
                  className="border-b border-line py-6 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold tracking-[0.16em] text-mist sm:text-xs">
                        {step.label}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-bodytext">
                        {step.text}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-semibold text-royal sm:text-xs">
                      {step.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto border-t border-line pt-6">
              <p className="text-sm leading-6 text-bodytext">
                For registration and payment questions, keep your registration
                reference handy so we can find you quickly.
              </p>
            </div>
          </motion.article>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mt-10 border-t border-line pt-6"
        >
          <p className="text-sm leading-6 text-bodytext">
            AI-CHHE 2026 · Department of Civil Engineering · NIT Patna
          </p>
        </motion.div>
      </div>
    </section>
  );
};
