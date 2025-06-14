package org.example.dobroz.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.example.dobroz.entity.ClientPayment;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientPaymentDTO {
    private Long paymentId;
    private Long clientId;
    private Integer year;
    private Integer month;
    private BigDecimal amount;
    private ClientPayment.PaymentStatus paymentStatus;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}