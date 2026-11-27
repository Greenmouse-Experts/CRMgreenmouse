import {
  normalizeMyLearningEntry,
  useMyTrainingLearning,
} from "@/api/trainingApi";
import { Award, BookOpen, ExternalLink } from "lucide-react";

export default function MyLearningSection() {
  const myLearningQuery = useMyTrainingLearning();
  const items = (myLearningQuery.data ?? [])
    .map(normalizeMyLearningEntry)
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  if (myLearningQuery.isLoading || items.length === 0) {
    return null;
  }

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="size-5 text-primary" />
          <h2 className="text-lg font-bold text-base-content">My Learning</h2>
        </div>
        <span className="badge badge-sm badge-ghost font-semibold">
          {items.length} enrolled
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => {
          const status = item.status.replace(/_/g, " ");

          return (
            <div
              key={item.id}
              className="rounded-xl border border-base-200 bg-base-200/30 p-3.5 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-semibold text-base-content truncate">
                  {item.courseTitle}
                </p>
                <p className="text-sm text-base-content/70 capitalize">
                  {status}
                </p>
              </div>

              {item.certificateUrl && (
                <a
                  href={item.certificateUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-outline btn-success rounded-lg gap-1 shrink-0"
                >
                  <Award className="size-3.5" />
                  <span>Certificate</span>
                  <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
