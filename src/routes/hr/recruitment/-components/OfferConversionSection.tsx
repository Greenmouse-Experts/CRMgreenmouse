import { Link } from "@tanstack/react-router";
import { Check, ArrowRight, UserCheck, Inbox } from "lucide-react";

interface OfferConversionSectionProps {
  offers: any[];
}

export default function OfferConversionSection({
  offers,
}: OfferConversionSectionProps) {
  const steps = [
    { name: "Generate offer", status: "completed" },
    { name: "Approval", status: "completed" },
    { name: "Sent", status: "completed" },
    { name: "Accepted", status: "current" },
    { name: "Convert to employee", status: "upcoming" },
    { name: "Start onboarding", status: "upcoming" },
  ];

  const acceptedOffer = offers.find((offer) =>
    ["accepted", "accept"].includes(
      String(offer?.status ?? offer?.decision ?? "").toLowerCase(),
    ),
  );

  const candidateName =
    acceptedOffer?.candidateName ??
    acceptedOffer?.applicantName ??
    acceptedOffer?.name ??
    [
      acceptedOffer?.application?.firstName,
      acceptedOffer?.application?.lastName,
    ]
      .filter(Boolean)
      .join(" ");

  const role =
    acceptedOffer?.jobTitle ??
    acceptedOffer?.vacancyTitle ??
    acceptedOffer?.application?.jobTitle;

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-base-content">
          Offer & conversion
        </h2>
        <p className="text-xs text-base-content/60">
          Track offer approvals, candidate acceptances, and seamless HR
          onboarding provisioning
        </p>
      </div>

      {/* Stepper */}
      <div className="relative py-2">
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center min-w-[620px] justify-between relative">
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-base-300 -z-0" />
            <div
              className="absolute top-4 left-6 h-0.5 bg-primary -z-0 transition-all duration-500"
              style={{ width: "60%" }}
            />

            {steps.map((step, idx) => {
              const isCompleted = step.status === "completed";
              const isCurrent = step.status === "current";

              return (
                <div
                  key={step.name}
                  className="relative z-10 flex flex-col items-center gap-2"
                >
                  <div
                    className={`size-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                      isCompleted
                        ? "bg-primary text-white shadow-xs"
                        : isCurrent
                          ? "bg-primary text-white ring-4 ring-primary/20 shadow-md scale-105"
                          : "bg-base-200 text-base-content/50 border border-base-300"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="size-4 stroke-[3]" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-xs text-center font-medium max-w-[90px] leading-tight ${
                      isCurrent
                        ? "text-primary font-bold"
                        : isCompleted
                          ? "text-base-content"
                          : "text-base-content/50"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {acceptedOffer && candidateName ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent border border-primary/20 p-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UserCheck className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-base-content">
                  {candidateName}
                </span>
                <span className="badge badge-xs bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold">
                  Accepted
                </span>
              </div>
              <p className="text-xs text-base-content/70 mt-0.5">
                {role ?? "Offer accepted"} · Ready for staff enrollment and
                setup
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/hr/onboarding"
              className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 text-xs font-semibold gap-1.5 shadow-sm shadow-primary/20"
            >
              <span>Continue to onboarding</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-base-300 bg-base-200/30 px-4 py-8 text-center">
          <Inbox className="size-6 text-base-content/40" />
          <p className="text-sm font-semibold text-base-content">
            No accepted offers yet
          </p>
          <p className="text-xs text-base-content/60">
            Accepted offers will appear here, ready for employee conversion and
            onboarding.
          </p>
        </div>
      )}
    </div>
  );
}
