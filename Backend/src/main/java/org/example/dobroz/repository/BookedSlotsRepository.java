package org.example.dobroz.repository;

import org.example.dobroz.entity.BookedSlots;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookedSlotsRepository extends JpaRepository<BookedSlots, Long> {
    List<BookedSlots> findByClientId(Long clientId);
    Optional<BookedSlots> findByClientIdAndBookingDate(Long clientId, LocalDate bookingDate);
    List<BookedSlots> findByClientIdAndBookingDateGreaterThanEqual(Long clientId, LocalDate date);
    List<BookedSlots> findByClientIdAndBookingDateBetween(Long clientId, LocalDate startDate, LocalDate endDate);
    void deleteByClientId(Long clientId);
}