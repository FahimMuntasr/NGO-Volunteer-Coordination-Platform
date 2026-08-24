type StatCardProps = {
  title: string;
  value: string | number;
};


export default function StatCard({
  title,
  value,
}: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-300/60 bg-[#f4f7fa] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-300/70 hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)]">

      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-100/60 transition duration-300 group-hover:scale-125" />


      <div className="relative">

        <p className="text-sm font-semibold text-slate-500">
          {title}
        </p>


        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </p>


        <div className="mt-5 h-1 w-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-400" />

      </div>

    </div>
  );
}