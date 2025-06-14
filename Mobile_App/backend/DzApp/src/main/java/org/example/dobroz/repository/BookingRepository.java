package org.example.dobroz.repository;

import org.example.dobroz.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserEmail(String userEmail);
}
