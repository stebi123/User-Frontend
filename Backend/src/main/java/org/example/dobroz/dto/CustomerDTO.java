package org.example.dobroz.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.example.dobroz.entity.ClientDetails;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDTO {
    private Long id;
    private String name;
    private String city;
    private String contactNumber;
    private ClientDetails.ClientStatus status;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}