import { useState, useEffect } from "react";

interface Venue {
  id: number;
  name: string;
  location: string;
  capacity: number;
  pricePerHour: number;
  type: string;
}

interface UseVenuesResult {
  featuredVenues: Venue[];
  turfEvents: Venue[];
  auditoriumEvents: Venue[];
  otherEvents: Venue[];
  loading: boolean;
  error: string | null;
}

export const useVenues = (): UseVenuesResult => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("http://localhost:8080/api/venues");
        if (!response.ok) {
          throw new Error("Failed to fetch venues");
        }
        const data = await response.json();
        setVenues(data);
      } catch (err) {
        setError("Unable to load venues. Please try again later.");
        console.error("Error fetching venues:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  // Filter the venues based on categories
  const featuredVenues = venues.filter((venue) =>
    ["Football Turf", "Auditorium"].includes(venue.type)
  );
  const turfEvents = venues.filter(
    (venue) => venue.type === "Football Turf" || venue.type === "Cricket Turf"
  );
  const auditoriumEvents = venues.filter((venue) => venue.type === "Auditorium");
  const otherEvents = venues.filter((venue) => venue.type === "Other Event");

  return {
    featuredVenues,
    turfEvents,
    auditoriumEvents,
    otherEvents,
    loading,
    error,
  };
};
