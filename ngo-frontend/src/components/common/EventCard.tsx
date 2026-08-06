type EventCardProps = {
  title: string;
  date: string;
  location: string;
  description: string;
};

export default function EventCard({
  title,
  date,
  location,
  description,
}: EventCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md transition hover:shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800">
        {title}
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        📅 {date}
      </p>

      <p className="text-sm text-gray-500">
        📍 {location}
      </p>

      <p className="mt-4 text-gray-600">
        {description}
      </p>

      <button className="mt-6 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700">
        View Details
      </button>
    </div>
  );
}