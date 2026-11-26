import type { ProbationReview } from "@/api/onboardingApi";
import { CheckCircle2, ClipboardCheck } from "lucide-react";

interface ProbationReviewsCardProps {
  hireName: string;
  reviews: ProbationReview[];
  onCompleteReview: (review: ProbationReview) => void;
}

const isReviewCompleted = (review: ProbationReview) =>
  Boolean(
    review.completed ||
    String(review.status ?? "").toLowerCase() === "completed",
  );

export default function ProbationReviewsCard({
  hireName,
  reviews,
  onCompleteReview,
}: ProbationReviewsCardProps) {
  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-base-200">
        <div>
          <h2 className="text-lg font-bold text-base-content">
            Probation reviews — {hireName}
          </h2>
          <p className="text-base-content/80 mt-0.5">
            Scheduled check-ins and evaluation outcomes
          </p>
        </div>
        <span className="badge badge-sm badge-ghost font-semibold">
          {reviews.filter(isReviewCompleted).length} of {reviews.length} done
        </span>
      </div>

      {reviews.length === 0 ? (
        <p className="py-6 text-center text-base-content/80 italic">
          No probation reviews scheduled for this employee yet.
        </p>
      ) : (
        <ul className="divide-y divide-base-200">
          {reviews.map((review) => {
            const completed = isReviewCompleted(review);
            const title =
              review.title ??
              review.milestone ??
              review.stage ??
              "Probation review";

            return (
              <li
                key={review.id}
                className="flex items-center gap-3.5 py-3 px-2"
              >
                <div
                  className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                    completed
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {completed ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <ClipboardCheck className="size-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      completed ? "text-base-content/80" : "text-base-content"
                    }`}
                  >
                    {title}
                  </p>
                  {review.notes && (
                    <p className="text-xs text-base-content/60 truncate">
                      {review.notes}
                    </p>
                  )}
                </div>

                {completed ? (
                  <span className="badge badge-sm bg-emerald-100 text-emerald-700 border-emerald-200 font-semibold shrink-0">
                    Completed
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onCompleteReview(review)}
                    className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-lg px-3 shrink-0"
                  >
                    Complete
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
