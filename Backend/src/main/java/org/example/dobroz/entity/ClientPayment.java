package org.example.dobroz.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "client_payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientPayment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    @Column(nullable = false)
    private Long clientId; // Foreign key reference to client_details.id

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus;

    @CreationTimestamp
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;

    // Enum for Payment Status
    public enum PaymentStatus {
        PENDING, PAID, FAILED, REFUNDED
    }

    // Unique constraint to ensure one payment record per client per year/month
    @Table(uniqueConstraints = {
            @UniqueConstraint(columnNames = {"clientId", "year", "month"})
    })
    public static class TableConstraints {}
}