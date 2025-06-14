package org.example.dobroz.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientCreationDTO {
    // Client Details
    @NotBlank
    @Size(max = 100)
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

    // Weekly Availability - Map of day to availability info
    @NotNull
    private Map<String, DayAvailabilityDTO> weeklyAvailability;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayAvailabilityDTO {
        private Boolean isAvailable;
        private LocalTime openingTime;
        private LocalTime closingTime;
    }
}