package org.example.dobroz.repository;

import org.example.dobroz.entity.ClientPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClientPaymentRepository extends JpaRepository<ClientPayment, Long> {
    List<ClientPayment> findByClientId(Long clientId);
    List<ClientPayment> findByPaymentStatus(ClientPayment.PaymentStatus status);
    List<ClientPayment> findByYearAndMonth(Integer year, Integer month);
    void deleteByClientId(Long clientId);
}