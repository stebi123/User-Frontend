package org.example.dobroz.repository;

import org.example.dobroz.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserEmail(String userEmail);

    @Query("SELECT b FROM Booking b WHERE b.venue.id = :venueId AND DATE(b.startTime) = :date")
    List<Booking> findByVenueIdAndDate(@Param("venueId") Long venueId, @Param("date") LocalDate date);
}