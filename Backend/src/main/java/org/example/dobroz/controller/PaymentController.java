package org.example.dobroz.controller;

import jakarta.validation.Valid;
import org.example.dobroz.dto.ClientPaymentDTO;
import org.example.dobroz.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/payments")
@PreAuthorize("hasRole('ADMIN')")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    /**
     * Get all payments with pagination
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "paymentId") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("ASC") ?
                Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<ClientPaymentDTO> paymentsPage = paymentService.getAllPayments(pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("payments", paymentsPage.getContent());
        response.put("currentPage", paymentsPage.getNumber());
        response.put("totalItems", paymentsPage.getTotalElements());
        response.put("totalPages", paymentsPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    /**
     * Get payment by ID
     */
    @GetMapping("/{paymentId}")
    public ResponseEntity<ClientPaymentDTO> getPaymentById(@PathVariable Long paymentId) {
        Optional<ClientPaymentDTO> payment = paymentService.getPaymentById(paymentId);
        return payment.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get payment details for a specific client
     */
    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<ClientPaymentDTO>> getClientPayments(@PathVariable Long clientId) {
        List<ClientPaymentDTO> payments = paymentService.getClientPayments(clientId);
        return ResponseEntity.ok(payments);
    }

    /**
     * Update payment details
     */
    @PutMapping("/{paymentId}")
    public ResponseEntity<ClientPaymentDTO> updatePayment(
            @PathVariable Long paymentId,
            @Valid @RequestBody ClientPaymentDTO paymentDTO) {
        try {
            Optional<ClientPaymentDTO> updatedPayment = paymentService.updatePayment(paymentId, paymentDTO);
            return updatedPayment.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Create a new payment record
     */
//    @PostMapping
//    public ResponseEntity<ClientPaymentDTO> createPayment(@Valid @RequestBody ClientPaymentDTO paymentDTO) {
//        try {
//            ClientPaymentDTO createdPayment = paymentService.createPayment(paymentDTO);
//            return ResponseEntity.ok(createdPayment);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().build();
//        }
//    }

    @PostMapping
    public ResponseEntity<ClientPaymentDTO> createPayment(@Valid @RequestBody ClientPaymentDTO paymentDTO) {
        try {
            ClientPaymentDTO createdPayment = paymentService.createPayment(paymentDTO);
            return new ResponseEntity<>(createdPayment, HttpStatus.CREATED); // Add HttpStatus.CREATED
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Delete a payment record
     */
    @DeleteMapping("/{paymentId}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long paymentId) {
        boolean isDeleted = paymentService.deletePayment(paymentId);
        return isDeleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    /**
     * Get payments by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ClientPaymentDTO>> getPaymentsByStatus(
            @PathVariable org.example.dobroz.entity.ClientPayment.PaymentStatus status) {
        List<ClientPaymentDTO> payments = paymentService.getPaymentsByStatus(status);
        return ResponseEntity.ok(payments);
    }

    /**
     * Get payments for a specific year and month
     */
    @GetMapping("/period")
    public ResponseEntity<List<ClientPaymentDTO>> getPaymentsByPeriod(
            @RequestParam Integer year,
            @RequestParam Integer month) {
        List<ClientPaymentDTO> payments = paymentService.getPaymentsByPeriod(year, month);
        return ResponseEntity.ok(payments);
    }
}