"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ABSTRACT_DECISIONS,
  type AbstractDecision,
} from "@/lib/domain";
import { trpc } from "@/lib/trpc";

type AdminAbstractDecisionFormProps = {
  readonly abstractId: number;
};

const DECISION_LABELS: Record<AbstractDecision, string> = {
  revision_requested: "Request changes",
  accepted: "Accept",
  rejected: "Reject",
};

const SELECT_CLASS =
  "mt-1.5 h-[44px] w-full rounded-lg border border-line bg-white px-3 text-[14px] text-navy outline-none focus:border-royal focus:ring-2 focus:ring-royal/15";

const TEXTAREA_CLASS =
  "mt-1.5 min-h-[90px] w-full resize-y rounded-lg border border-line bg-white px-3 py-2.5 text-[13px] leading-relaxed text-navy outline-none placeholder:text-mist focus:border-royal focus:ring-2 focus:ring-royal/15";

export const AdminAbstractDecisionForm = ({
  abstractId,
}: AdminAbstractDecisionFormProps) => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [decision, setDecision] = useState<AbstractDecision>(
    ABSTRACT_DECISIONS[0],
  );
  const [internalComment, setInternalComment] = useState("");
  const [participantComment, setParticipantComment] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const recordDecision = trpc.admin.abstracts.decide.useMutation({
    onSuccess: (result) => {
      setFeedback(
        result.changed
          ? `Decision recorded — the status is now ${result.status.replaceAll("_", " ")}.`
          : "Decision recorded. The status did not change.",
      );
      setFieldError(null);
      setInternalComment("");
      setParticipantComment("");
      void utils.admin.abstracts.byId.invalidate({ abstractId });
      void utils.admin.abstracts.list.invalidate();
      void utils.admin.overview.invalidate();
      router.refresh();
    },
    onError: (error) => {
      setFeedback(error.message);
    },
  });

  const submit = () => {
    setFeedback(null);
    setFieldError(null);

    const trimmedMessage = participantComment.trim();

    if (decision !== "accepted" && !trimmedMessage) {
      setFieldError(
        "A note to the authors is required when requesting changes or rejecting.",
      );
      return;
    }

    recordDecision.mutate({
      abstractId,
      decision,
      ...(internalComment.trim()
        ? { internalComment: internalComment.trim() }
        : {}),
      ...(trimmedMessage ? { participantComment: trimmedMessage } : {}),
    });
  };

  return (
    <section className="rounded-xl border border-line bg-white p-5">
      <h2 className="text-[15px] font-semibold text-navy">Record decision</h2>
      <p className="mt-1 text-[13px] leading-relaxed text-mist">
        Sets the abstract status and adds an entry to the review history.
        Requesting changes or rejecting needs a note for the authors; accepting
        does not.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div>
          <label
            htmlFor="abstract-decision"
            className="text-[13px] font-medium text-navy"
          >
            Decision
          </label>
          <select
            id="abstract-decision"
            value={decision}
            onChange={(event) =>
              setDecision(event.target.value as AbstractDecision)
            }
            className={SELECT_CLASS}
          >
            {ABSTRACT_DECISIONS.map((value) => (
              <option key={value} value={value}>
                {DECISION_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="abstract-participant-comment"
            className="text-[13px] font-medium text-navy"
          >
            Note to authors{" "}
            {decision !== "accepted" ? (
              <span aria-hidden="true" className="text-errorred">
                *
              </span>
            ) : (
              <span className="font-normal text-mist">(optional)</span>
            )}
          </label>
          <textarea
            id="abstract-participant-comment"
            value={participantComment}
            onChange={(event) => setParticipantComment(event.target.value)}
            placeholder="Shown to the authors with the decision"
            aria-invalid={Boolean(fieldError)}
            className={TEXTAREA_CLASS}
          />
          {fieldError ? (
            <p role="alert" className="mt-1.5 text-[12px] text-errorred">
              {fieldError}
            </p>
          ) : null}
        </div>

        <div className="lg:col-span-2">
          <label
            htmlFor="abstract-internal-comment"
            className="text-[13px] font-medium text-navy"
          >
            Internal note{" "}
            <span className="font-normal text-mist">(optional)</span>
          </label>
          <textarea
            id="abstract-internal-comment"
            value={internalComment}
            onChange={(event) => setInternalComment(event.target.value)}
            placeholder="Only visible to admins"
            className={TEXTAREA_CLASS}
          />
        </div>

        <div className="lg:col-span-2">
          <Button
            type="button"
            className="h-[44px]"
            disabled={recordDecision.isPending}
            onClick={submit}
          >
            {recordDecision.isPending ? "Recording…" : "Record decision"}
          </Button>
        </div>
      </div>

      {feedback ? (
        <p
          role="status"
          className="mt-3 rounded-lg border border-line bg-canvas px-3 py-2 text-[13px] text-bodytext"
        >
          {feedback}
        </p>
      ) : null}
    </section>
  );
};
