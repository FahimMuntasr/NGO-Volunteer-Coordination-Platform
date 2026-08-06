import DashboardLayout from "../layouts/DashboardLayout";
import EventCard from "../components/common/EventCard";

const events = [
  {
    id: 1,
    title: "Tree Plantation Drive",
    date: "20 August 2026",
    location: "Dhaka",
    description: "Help plant trees around the city to promote a greener environment.",
  },
  {
    id: 2,
    title: "Blood Donation Camp",
    date: "28 August 2026",
    location: "NSU Campus",
    description: "Volunteer and donate blood to help patients in need.",
  },
  {
    id: 3,
    title: "Book Distribution",
    date: "5 September 2026",
    location: "Gazipur",
    description: "Distribute educational books to underprivileged children.",
  },
];

export default function Events() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="mb-8 text-3xl font-bold">
          Events
        </h1>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              date={event.date}
              location={event.location}
              description={event.description}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}