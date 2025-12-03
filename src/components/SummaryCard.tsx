export default function SummaryCard({
  item,
}: {
  item: {
    title: string;
    value: any;
  };
}) {
  return (
    <div>
      <div key={item.title} className="bg-base-100 shadow rounded-box">
        <div className="stat">
          <div className="stat-title">{item.title}</div>
          <div className="stat-value">{item.value}</div>
        </div>
      </div>
    </div>
  );
}
