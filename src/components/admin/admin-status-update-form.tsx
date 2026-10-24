"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  REGISTRATION_STATUSES,
  type RegistrationStatus,
} from "@/lib/domain";
import { trpc } from "@/lib/trpc";

type AdminStatusUpdateFormProps = {
  readonly registrationId: number;
  readonly currentStatus: RegistrationStatus;
};

const SELECT_CLASS =
  "mt-1.5 h-[44px] w-full rounded-lg border border-line bg-white px-3 text-[14px] text-navy outline-none focus:border-royal focus:ring-2 focus:ring-royal/15";

const INPUT_CLASS =
  "mt-1.5 h-[44px] w-full rounded-lg border border-line bg-white px-3 text-[14px] text-navy outline-none placeholder:text-mist focus:border-royal focus:ring-2 focus:ring-royal/15";

export const AdminStatusUpdateForm = ({
  registrationId,
  currentStatus,
}: AdminStatusUpdateFormProps) => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [status, setStatus] = useState<RegistrationStatus>(currentStatus);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const updateStatus = trpc.admin.registrations.updateStatus.useMutation({
    onSuccess: (result) => {
      setFeedback(
        result.changed
          ? "Status updated. The delegate email has been queued if required."
          : "No change — this registration already has that status.",
      );
      void utils.admin.registrations.byId.invalidate({ registrationId });
      void utils.admin.registrations.list.invalidate();
      void utils.admin.overview.invalidate();
      router.refresh();
    },
    onError: (error) => {
      setFeedback(error.message);
    },
  });

  const submit = () => {
    setFeedback(null);
    updateStatus.mutate({
      registrationId,
      status,
      ...(message.trim() ? { message: message.trim() } : {}),
    });
  };

  return (
    <section className="rounded-xl border border-line bg-white p-5">
      <h2 className="text-[15px] font-semibold text-navy">Verify registration</h2>
      <p className="mt-1 text-[13px] leading-relaxed text-mist">
        Confirm once the bank transfer is verified. Confirming or cancelling
        emails the delegate a fresh private access link.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)_auto] sm:items-end">
        <div>
          <label htmlFor="status" className="text-[13px] font-medium text-navy">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as RegistrationStatus)
            }
            className={SELECT_CLASS}
          >
            {REGISTRATION_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="message" className="text-[13px] font-medium text-navy">
            Note to delegate{" "}
            <span className="font-normal text-mist">(optional)</span>
          </label>
          <input
            id="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Included in the status email"
            className={INPUT_CLASS}
          />
        </div>
        <Button
          type="button"
          className="h-[44px]"
          disabled={updateStatus.isPending}
          onClick={submit}
        >
          {updateStatus.isPending ? "Updating…" : "Update status"}
        </Button>
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
