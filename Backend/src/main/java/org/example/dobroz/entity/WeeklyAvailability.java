package org.example.dobroz.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalTime;
import java.time.ZonedDateTime;

@Entity
@Table(name = "weekly_availability")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyAvailability {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long availabilityId;

    @Column(nullable = false)
    private Long clientId; // Foreign key reference to client_details.id

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DayOfWeek dayOfWeek;

    @Column(nullable = false)
    private Boolean isAvailable = false; // Whether the client is available on this day

    private LocalTime openingTime; // Opening time for this specific day
    private LocalTime closingTime; // Closing time for this specific day

    @CreationTimestamp
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;

    // Enum for Days of Week
    public enum DayOfWeek {
        MONDAY,
        TUESDAY,
        WEDNESDAY,
        THURSDAY,
        FRIDAY,
        SATURDAY,
        SUNDAY
    }

    // Unique constraint to ensure one record per client per day
    @Table(uniqueConstraints = {
            @UniqueConstraint(columnNames = {"clientId", "dayOfWeek"})
    })
    public static class TableConstraints {}

    // Helper method to check if client is open at a specific time on this day
    public boolean isOpenAt(LocalTime time) {
        if (!isAvailable || openingTime == null || closingTime == null) {
            return false;
        }

        // Handle cases where closing time is after midnight (next day)
        if (closingTime.isBefore(openingTime)) {
            // e.g., opens at 22:00, closes at 02:00 (next day)
            return time.isAfter(openingTime) || time.equals(openingTime) ||
                    time.isBefore(closingTime) || time.equals(closingTime);
        } else {
            // Normal case: opens and closes on the same day
            return (time.isAfter(openingTime) || time.equals(openingTime)) &&
                    (time.isBefore(closingTime) || time.equals(closingTime));
        }
    }

    // Helper method to get total available hours for this day
    public long getAvailableHours() {
        if (!isAvailable || openingTime == null || closingTime == null) {
            return 0;
        }

        if (closingTime.isBefore(openingTime)) {
            // Spans midnight
            long hoursToMidnight = 24 - openingTime.getHour();
            long hoursFromMidnight = closingTime.getHour();
            return hoursToMidnight + hoursFromMidnight;
        } else {
            return closingTime.getHour() - openingTime.getHour();
        }
    }
}