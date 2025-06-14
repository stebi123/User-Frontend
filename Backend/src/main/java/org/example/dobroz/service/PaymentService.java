package org.example.dobroz.service;

import org.example.dobroz.dto.ClientPaymentDTO;
import org.example.dobroz.entity.ClientPayment;
import org.example.dobroz.repository.ClientPaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PaymentService {
    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    @Autowired
    private ClientPaymentRepository clientPaymentRepository;

    @Transactional(readOnly = true)
    public Page<ClientPaymentDTO> getAllPayments(Pageable pageable) {
        return clientPaymentRepository.findAll(pageable)
                .map(this::convertToClientPaymentDTO);
    }

    @Transactional(readOnly = true)
    public Optional<ClientPaymentDTO> getPaymentById(Long paymentId) {
        return clientPaymentRepository.findById(paymentId)
                .map(this::convertToClientPaymentDTO);
    }

    @Transactional(readOnly = true)
    public List<ClientPaymentDTO> getClientPayments(Long clientId) {
        return clientPaymentRepository.findByClientId(clientId)
                .stream()
                .map(this::convertToClientPaymentDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public Optional<ClientPaymentDTO> updatePayment(Long paymentId, ClientPaymentDTO paymentDTO) {
        Optional<ClientPayment> existingPayment = clientPaymentRepository.findById(paymentId);
        if (existingPayment.isEmpty()) {
            return Optional.empty();
        }

        ClientPayment payment = existingPayment.get();
        payment.setYear(paymentDTO.getYear());
        payment.setMonth(paymentDTO.getMonth());
        payment.setAmount(paymentDTO.getAmount());
        payment.setPaymentStatus(paymentDTO.getPaymentStatus());

        ClientPayment updatedPayment = clientPaymentRepository.save(payment);
        return Optional.of(convertToClientPaymentDTO(updatedPayment));
    }

    @Transactional
    public ClientPaymentDTO createPayment(ClientPaymentDTO paymentDTO) {
        ClientPayment payment = convertToClientPaymentEntity(paymentDTO);
        ClientPayment savedPayment = clientPaymentRepository.save(payment);
        return convertToClientPaymentDTO(savedPayment);
    }

    @Transactional
    public boolean deletePayment(Long paymentId) {
        if (!clientPaymentRepository.existsById(paymentId)) {
            return false;
        }
        clientPaymentRepository.deleteById(paymentId);
        return true;
    }

    @Transactional(readOnly = true)
    public List<ClientPaymentDTO> getPaymentsByStatus(ClientPayment.PaymentStatus status) {
        return clientPaymentRepository.findByPaymentStatus(status)
                .stream()
                .map(this::convertToClientPaymentDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClientPaymentDTO> getPaymentsByPeriod(Integer year, Integer month) {
        return clientPaymentRepository.findByYearAndMonth(year, month)
                .stream()
                .map(this::convertToClientPaymentDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ClientPaymentDTO createInitialClientPaymentRecord(Long clientId) {
        YearMonth currentMonth = YearMonth.now();
        ClientPayment payment = new ClientPayment();
        payment.setClientId(clientId);
        payment.setYear(currentMonth.getYear());
        payment.setMonth(currentMonth.getMonthValue());
        payment.setAmount(BigDecimal.ZERO);
        payment.setPaymentStatus(ClientPayment.PaymentStatus.PENDING);

        ClientPayment savedPayment = clientPaymentRepository.save(payment);
        return convertToClientPaymentDTO(savedPayment);
    }

    @Transactional
    public void deleteClientPayments(Long clientId) {
        clientPaymentRepository.deleteByClientId(clientId);
    }

    // Helper methods for DTO conversion
    private ClientPaymentDTO convertToClientPaymentDTO(ClientPayment payment) {
        ClientPaymentDTO dto = new ClientPaymentDTO();
        dto.setPaymentId(payment.getPaymentId());
        dto.setClientId(payment.getClientId());
        dto.setYear(payment.getYear());
        dto.setMonth(payment.getMonth());
        dto.setAmount(payment.getAmount());
        dto.setPaymentStatus(payment.getPaymentStatus());
        dto.setCreatedAt(payment.getCreatedAt());
        dto.setUpdatedAt(payment.getUpdatedAt());
        return dto;
    }

    private ClientPayment convertToClientPaymentEntity(ClientPaymentDTO dto) {
        ClientPayment payment = new ClientPayment();
        payment.setPaymentId(dto.getPaymentId());
        payment.setClientId(dto.getClientId());
        payment.setYear(dto.getYear());
        payment.setMonth(dto.getMonth());
        payment.setAmount(dto.getAmount());
        payment.setPaymentStatus(dto.getPaymentStatus());
        return payment;
    }
}