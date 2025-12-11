import type { PropsWithChildren } from "react";

interface PageHeaderProps extends PropsWithChildren {
  title?: string;
  decription?: string;
  side?: any;
}

export default function PageHeader(props: PageHeaderProps) {
  const {
    title = "Dashboard",
    decription = "Welcome back! Here's your system overview.",
    side,
  } = props;
  return (
    <div className="flex py-5 flex-col md:flex-row gap-2">
      <div>
        <h1 className="text-3xl font-bold text-base-content">{title}</h1>
        <p className="text-sm opacity-70  mt-1">{decription}</p>
      </div>
      <div className="flex gap-2 md:*:w-auto w-full md:flex-row *:flex-1   md:w-fit md:ml-auto">
        {props.children}
      </div>
    </div>
  );
}
