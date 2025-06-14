package org.example.dobroz.repository;

import org.example.dobroz.entity.ClientDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClientDetailsRepository extends JpaRepository<ClientDetails, Long> {
    List<ClientDetails> findByStatus(ClientDetails.ClientStatus status);
    List<ClientDetails> findByCity(String city);
    List<ClientDetails> findByState(String state);
    List<ClientDetails> findByNameContainingIgnoreCase(String name);
}