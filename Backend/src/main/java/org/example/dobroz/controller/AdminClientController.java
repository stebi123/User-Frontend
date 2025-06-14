package org.example.dobroz.controller;

import jakarta.validation.Valid;
import org.example.dobroz.dto.*;
import org.example.dobroz.entity.ClientDetails;
import org.example.dobroz.service.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/clients")
@PreAuthorize("hasRole('ADMIN')")
public class AdminClientController {

    @Autowired
    private ClientService clientService;

    /**
     * Get all clients with pagination
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllClients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("ASC") ?
                Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<ClientDetailsDTO> clientsPage = clientService.getAllClients(pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("clients", clientsPage.getContent());
        response.put("currentPage", clientsPage.getNumber());
        response.put("totalItems", clientsPage.getTotalElements());
        response.put("totalPages", clientsPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    /**
     * Get all customers with pagination (simplified view)
     */
    @GetMapping("/customers")
    public ResponseEntity<Map<String, Object>> getAllCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("ASC") ?
                Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<CustomerDTO> customersPage = clientService.getAllCustomers(pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("customers", customersPage.getContent());
        response.put("currentPage", customersPage.getNumber());
        response.put("totalItems", customersPage.getTotalElements());
        response.put("totalPages", customersPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    /**
     * Get clients by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ClientDetailsDTO>> getClientsByStatus(
            @PathVariable ClientDetails.ClientStatus status) {
        List<ClientDetailsDTO> clients = clientService.getClientsByStatus(status);
        return ResponseEntity.ok(clients);
    }

    /**
     * Get client by ID with all related data
     */
    @GetMapping("/{id}")
    public ResponseEntity<ClientDetailsDTO> getClientById(@PathVariable Long id) {
        Optional<ClientDetailsDTO> client = clientService.getClientById(id);
        return client.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new client with availability and booking slots
     */
    @PostMapping
    public ResponseEntity<ClientDetailsDTO> createClient(
            @Valid @RequestBody ClientCreationDTO clientCreationDTO) {
        try {
            ClientDetailsDTO createdClient = clientService.createClientWithAvailability(clientCreationDTO);
            return new ResponseEntity<>(createdClient, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Search clients by ID or name
     */
    @PostMapping("/search")
    public ResponseEntity<List<ClientDetailsDTO>> searchClients(@RequestBody ClientSearchRequest searchRequest) {
        List<ClientDetailsDTO> clients = clientService.searchClients(
                searchRequest.getId(),
                searchRequest.getName()
        );
        return ResponseEntity.ok(clients);
    }

    /**
     * Search customers by ID or name (simplified view)
     */
    @PostMapping("/search/customer")
    public ResponseEntity<List<CustomerDTO>> searchCustomers(@RequestBody ClientSearchRequest searchRequest) {
        List<CustomerDTO> customers = clientService.searchCustomers(
                searchRequest.getId(),
                searchRequest.getName()
        );
        return ResponseEntity.ok(customers);
    }

    /**
     * Update an existing client
     */
    @PutMapping("/{id}")
    public ResponseEntity<ClientDetailsDTO> updateClient(
            @PathVariable Long id,
            @Valid @RequestBody ClientCreationDTO clientCreationDTO) {
        try {
            Optional<ClientDetailsDTO> updatedClient = clientService.updateClientWithAvailability(id, clientCreationDTO);
            return updatedClient.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update client status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ClientDetailsDTO> updateClientStatus(
            @PathVariable Long id,
            @RequestParam ClientDetails.ClientStatus status) {
        Optional<ClientDetailsDTO> updatedClient = clientService.updateClientStatus(id, status);
        return updatedClient.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete a client (and all related data)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable Long id) {
        boolean isDeleted = clientService.deleteClient(id);
        return isDeleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    /**
     * Get weekly availability for a client
     */
    @GetMapping("/{id}/availability")
    public ResponseEntity<Map<String, Object>> getClientAvailability(@PathVariable Long id) {
        Map<String, Object> availability = clientService.getClientWeeklyAvailability(id);
        return availability.isEmpty() ? ResponseEntity.notFound().build() : ResponseEntity.ok(availability);
    }

    /**
     * Get booked slots for a client on a specific date
     */
    @GetMapping("/{id}/bookings")
    public ResponseEntity<Map<String, Object>> getClientBookings(
            @PathVariable Long id,
            @RequestParam String date) {
        try {
            Map<String, Object> bookings = clientService.getClientBookingsForDate(id, date);
            return bookings.isEmpty() ? ResponseEntity.notFound().build() : ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}