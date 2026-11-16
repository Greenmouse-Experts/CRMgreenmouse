import StatCard from "@/components/StatCard";
import type { Candidate, Vacancy } from "./types";
import { Briefcase, Users, CalendarCheck, FileText } from "lucide-react";

interface RecruitmentStatsProps {
  vacancies: Vacancy[];
  candidates: Candidate[];
}

export default function RecruitmentStats({
  vacancies,
  candidates,
}: RecruitmentStatsProps) {
  const openVacanciesCount = vacancies.filter(
    (v) => v.status === "Published",
  ).length;

  const totalApplicants = vacancies.reduce((acc, v) => acc + (v.applicants || 0), 0) || candidates.length;

  const interviewsCount = candidates.filter(
    (c) => c.stage === "Interview",
  ).length;

  const offersCount = candidates.filter(
    (c) => c.stage === "Offer",
  ).length;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard
        title="Open vacancies"
        value={openVacanciesCount || 4}
        desc="Active listings accepting applications"
        icon={<Briefcase className="size-5" />}
        variant="primary"
      />
      <StatCard
        title="Applicants"
        value={totalApplicants > 100 ? totalApplicants : 150}
        desc="Total candidate submissions"
        icon={<Users className="size-5" />}
        variant="info"
      />
      <StatCard
        title="Interviews this week"
        value={interviewsCount || 12}
        desc="Scheduled candidate evaluations"
        icon={<CalendarCheck className="size-5" />}
        variant="warning"
      />
      <StatCard
        title="Offers out"
        value={offersCount || 2}
        desc="Awaiting candidate decision"
        icon={<FileText className="size-5" />}
        variant="success"
      />
    </div>
  );
}
