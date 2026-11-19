import StatCard from "@/components/StatCard";
import type { RecruitmentDashboard } from "@/api/recruitmentApi";
import { Briefcase, Users, CalendarCheck, FileText } from "lucide-react";

interface RecruitmentStatsProps {
  stats: RecruitmentDashboard;
}

export default function RecruitmentStats({ stats }: RecruitmentStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard
        title="Open vacancies"
        value={stats.openVacancies ?? 0}
        desc="Active listings accepting applications"
        icon={<Briefcase className="size-5" />}
        variant="primary"
      />
      <StatCard
        title="Applicants"
        value={stats.applicants ?? 0}
        desc="Total candidate submissions"
        icon={<Users className="size-5" />}
        variant="info"
      />
      <StatCard
        title="Interviews this week"
        value={stats.interviewsThisWeek ?? 0}
        desc="Scheduled candidate evaluations"
        icon={<CalendarCheck className="size-5" />}
        variant="warning"
      />
      <StatCard
        title="Offers out"
        value={stats.offersOut ?? 0}
        desc="Awaiting candidate decision"
        icon={<FileText className="size-5" />}
        variant="success"
      />
    </div>
  );
}
