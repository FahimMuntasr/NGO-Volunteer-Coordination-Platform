type StatCardProps = {
  title: string;
  value: string | number;
};

export default function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <h2 className="text-sm font-medium text-gray-500">
        {title}
      </h2>

      <p className="mt-3 text-3xl font-bold text-gray-800">
        {value}
      </p>
    </div>
  );
}