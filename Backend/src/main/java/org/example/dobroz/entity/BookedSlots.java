package org.example.dobroz.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.ZonedDateTime;

@Entity
@Table(name = "booked_slots")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookedSlots {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    @Column(nullable = false)
    private Long clientId; // Foreign key reference to client_details.id

    @Column(nullable = false)
    private LocalDate bookingDate;

    // 24 hour slots (00:00 to 23:59)
    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'none'")
    private String slot00 = "none"; // 00:00-00:59

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'none'")
    private String slot01 = "none"; // 01:00-01:59

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'none'")
    private String slot02 = "none"; // 02:00-02:59

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'none'")
    private String slot03 = "none"; // 03:00-03:59

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'none'")
    private String slot04 = "none"; // 04:00-04:59

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'none'")
    private String slot05 = "none"; // 05:00-05:59

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'none'")
    private String slot06 = "none"; // 06:00-06:59

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'none'")
    private String slot07 = "none"; // 07:00-07:59

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'none'")
    private String slot08 = "none"; // 08:00-08:59

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'none'")
    private String slot09 = "none"; // 09:00-09:59

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'none'")
    private String slot10 = "none"; // 10:00-10:59

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'none'")
    private String slot11 = "none"; // 11:00-11:59

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'none'")
    private String slot12 = "none"; // 12:00-12:59

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'none'")
    private String slot13 = "none"; // 13:00-13:59

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'none'")
    private String slot14 = "none"; // 14:00-14:59

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'none'")
    private String slot15 = "none"; // 15:00-15:59

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'none'")
    private String slot16 = "none"; // 16:00-16:59

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'none'")
    private String slot17 = "none"; // 17:00-17:59

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'none'")
    private String slot18 = "none"; // 18:00-18:59

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'none'")
    private String slot19 = "none"; // 19:00-19:59

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'none'")
    private String slot20 = "none"; // 20:00-20:59

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'none'")
    private String slot21 = "none"; // 21:00-21:59

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'none'")
    private String slot22 = "none"; // 22:00-22:59

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'none'")
    private String slot23 = "none"; // 23:00-23:59

    @CreationTimestamp
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;

    // Unique constraint to ensure one record per client per date
    @Table(uniqueConstraints = {
            @UniqueConstraint(columnNames = {"clientId", "bookingDate"})
    })
    public static class TableConstraints {}

    // Helper method to get slot value by hour
    public String getSlotByHour(int hour) {
        return switch (hour) {
            case 0 -> slot00;
            case 1 -> slot01;
            case 2 -> slot02;
            case 3 -> slot03;
            case 4 -> slot04;
            case 5 -> slot05;
            case 6 -> slot06;
            case 7 -> slot07;
            case 8 -> slot08;
            case 9 -> slot09;
            case 10 -> slot10;
            case 11 -> slot11;
            case 12 -> slot12;
            case 13 -> slot13;
            case 14 -> slot14;
            case 15 -> slot15;
            case 16 -> slot16;
            case 17 -> slot17;
            case 18 -> slot18;
            case 19 -> slot19;
            case 20 -> slot20;
            case 21 -> slot21;
            case 22 -> slot22;
            case 23 -> slot23;
            default -> throw new IllegalArgumentException("Hour must be between 0 and 23");
        };
    }

    // Helper method to set slot value by hour
    public void setSlotByHour(int hour, String value) {
        switch (hour) {
            case 0 -> slot00 = value;
            case 1 -> slot01 = value;
            case 2 -> slot02 = value;
            case 3 -> slot03 = value;
            case 4 -> slot04 = value;
            case 5 -> slot05 = value;
            case 6 -> slot06 = value;
            case 7 -> slot07 = value;
            case 8 -> slot08 = value;
            case 9 -> slot09 = value;
            case 10 -> slot10 = value;
            case 11 -> slot11 = value;
            case 12 -> slot12 = value;
            case 13 -> slot13 = value;
            case 14 -> slot14 = value;
            case 15 -> slot15 = value;
            case 16 -> slot16 = value;
            case 17 -> slot17 = value;
            case 18 -> slot18 = value;
            case 19 -> slot19 = value;
            case 20 -> slot20 = value;
            case 21 -> slot21 = value;
            case 22 -> slot22 = value;
            case 23 -> slot23 = value;
            default -> throw new IllegalArgumentException("Hour must be between 0 and 23");
        }
    }
}