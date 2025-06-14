package org.example.dobroz.repository;

import org.example.dobroz.entity.WeeklyAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WeeklyAvailabilityRepository extends JpaRepository<WeeklyAvailability, Long> {
    List<WeeklyAvailability> findByClientId(Long clientId);
    Optional<WeeklyAvailability> findByClientIdAndDayOfWeek(Long clientId, WeeklyAvailability.DayOfWeek dayOfWeek);
    void deleteByClientId(Long clientId);
}