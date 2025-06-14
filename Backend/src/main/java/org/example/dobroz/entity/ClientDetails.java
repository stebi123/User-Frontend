package org.example.dobroz.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.ZonedDateTime;

@Entity
@Table(name = "client_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Location Details
    @Size(max = 200)
    private String address;

    @Size(max = 50)
    private String city;

    @Size(max = 50)
    private String state;

    @Size(max = 20)
    private String zipcode;

    private Double latitude;
    private Double longitude;

    // Pricing Info
    private BigDecimal pricePerSlot;

    // Media & Contact
    @Column(columnDefinition = "JSON")
    private String imageUrls; // Stored as JSON array of URLs

    @Size(max = 20)
    private String contactNumber;

    @Size(max = 100)
    private String email;

    @Size(max = 200)
    private String website;

    // Banking Details - FIXED WITH EXPLICIT COLUMN MAPPINGS
    @Column(name = "account_number")
    @Size(max = 100)
    private String accountNumber;

    @Column(name = "account_type")
    @Size(max = 100)
    private String accountType;

    @Size(max = 100)
    private String branch;

    @Column(name = "ifsc_code")
    @Size(max = 100)
    private String ifscCode;

    @Column(name = "upi_id")
    @Size(max = 100)
    private String upiId;

    // Admin Metadata
    @Enumerated(EnumType.STRING)
    private ClientStatus status;

    @CreationTimestamp
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;

    // Enum for Status
    public enum ClientStatus {
        ACTIVE, INACTIVE, PENDING
    }
}