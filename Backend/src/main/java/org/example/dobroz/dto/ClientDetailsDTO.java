package org.example.dobroz.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.example.dobroz.entity.ClientDetails;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientDetailsDTO {
    private Long id;
    private String name;
    private String description;
    private String address;
    private String city;
    private String state;
    private String zipcode;
    private Double latitude;
    private Double longitude;
    private BigDecimal pricePerSlot;
    private List<String> imageUrls;
    private String contactNumber;
    private String email;
    private String website;
    private String accountNumber;
    private String accountType;
    private String branch;
    private String ifscCode;
    private String upiId;
    private ClientDetails.ClientStatus status;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    // Include weekly availability
    private Map<String, WeeklyAvailabilityDTO> weeklyAvailability;
}