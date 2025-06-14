package org.example.dobroz.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.example.dobroz.entity.WeeklyAvailability;

import java.time.LocalTime;
import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyAvailabilityDTO {
    private Long availabilityId;
    private WeeklyAvailability.DayOfWeek dayOfWeek;
    private Boolean isAvailable;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}