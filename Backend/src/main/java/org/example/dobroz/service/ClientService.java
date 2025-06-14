package org.example.dobroz.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.dobroz.dto.*;
import org.example.dobroz.entity.BookedSlots;
import org.example.dobroz.entity.ClientDetails;
import org.example.dobroz.entity.ClientPayment;
import org.example.dobroz.entity.WeeklyAvailability;
import org.example.dobroz.repository.BookedSlotsRepository;
import org.example.dobroz.repository.ClientDetailsRepository;
import org.example.dobroz.repository.ClientPaymentRepository;
import org.example.dobroz.repository.WeeklyAvailabilityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ClientService {
    private static final Logger logger = LoggerFactory.getLogger(ClientService.class);

    @Autowired
    private ClientDetailsRepository clientDetailsRepository;

    @Autowired
    private WeeklyAvailabilityRepository weeklyAvailabilityRepository;

    @Autowired
    private BookedSlotsRepository bookedSlotsRepository;

    @Autowired
    private ClientPaymentRepository clientPaymentRepository;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public Page<ClientDetailsDTO> getAllClients(Pageable pageable) {
        return clientDetailsRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public Page<CustomerDTO> getAllCustomers(Pageable pageable) {
        return clientDetailsRepository.findAll(pageable)
                .map(this::convertToCustomerDTO);
    }

    @Transactional(readOnly = true)
    public List<ClientDetailsDTO> getClientsByStatus(ClientDetails.ClientStatus status) {
        return clientDetailsRepository.findByStatus(status)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<ClientDetailsDTO> getClientById(Long id) {
        return clientDetailsRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Transactional
    public ClientDetailsDTO createClientWithAvailability(ClientCreationDTO clientCreationDTO) {
        // 1. Create and save client details
        ClientDetails clientDetails = convertToClientEntity(clientCreationDTO);
        clientDetails.setStatus(ClientDetails.ClientStatus.PENDING);
        ClientDetails savedClient = clientDetailsRepository.save(clientDetails);

        // 2. Create weekly availability records
        createWeeklyAvailabilityRecords(savedClient.getId(), clientCreationDTO.getWeeklyAvailability());

        // 3. Create initial booked slots records for the next 30 days
        createInitialBookedSlotsRecords(savedClient.getId());

        // 4. Create initial client payment record for the current month
        createInitialClientPaymentRecord(savedClient.getId());

        return convertToDTO(savedClient);
    }

    @Transactional(readOnly = true)
    public List<ClientDetailsDTO> searchClients(Long id, String name) {
        if (id != null) {
            return clientDetailsRepository.findById(id)
                    .map(this::convertToDTO)
                    .map(List::of)
                    .orElse(Collections.emptyList());
        } else if (name != null && !name.trim().isEmpty()) {
            return clientDetailsRepository.findByNameContainingIgnoreCase(name)
                    .stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        }
        return Collections.emptyList();
    }

    @Transactional(readOnly = true)
    public List<CustomerDTO> searchCustomers(Long id, String name) {
        if (id != null) {
            return clientDetailsRepository.findById(id)
                    .map(this::convertToCustomerDTO)
                    .map(List::of)
                    .orElse(Collections.emptyList());
        } else if (name != null && !name.trim().isEmpty()) {
            return clientDetailsRepository.findByNameContainingIgnoreCase(name)
                    .stream()
                    .map(this::convertToCustomerDTO)
                    .collect(Collectors.toList());
        }
        return Collections.emptyList();
    }

    @Transactional
    public Optional<ClientDetailsDTO> updateClientWithAvailability(Long id, ClientCreationDTO clientCreationDTO) {
        Optional<ClientDetails> existingClient = clientDetailsRepository.findById(id);
        if (existingClient.isEmpty()) {
            return Optional.empty();
        }

        // 1. Update client details
        ClientDetails clientDetails = convertToClientEntity(clientCreationDTO);
        clientDetails.setId(id);
        ClientDetails updatedClient = clientDetailsRepository.save(clientDetails);

        // 2. Update weekly availability
        updateWeeklyAvailabilityRecords(id, clientCreationDTO.getWeeklyAvailability());

        // 3. Update existing booked slots based on new availability
        updateBookedSlotsBasedOnAvailability(id);

        return Optional.of(convertToDTO(updatedClient));
    }

    @Transactional
    public Optional<ClientDetailsDTO> updateClientStatus(Long id, ClientDetails.ClientStatus status) {
        return clientDetailsRepository.findById(id)
                .map(client -> {
                    client.setStatus(status);
                    return convertToDTO(clientDetailsRepository.save(client));
                });
    }

    @Transactional
    public boolean deleteClient(Long id) {
        if (!clientDetailsRepository.existsById(id)) {
            return false;
        }

        // Delete related records first
        weeklyAvailabilityRepository.deleteByClientId(id);
        bookedSlotsRepository.deleteByClientId(id);
//        clientPaymentRepository.deleteByClientId(id);
        paymentService.deleteClientPayments(id);
        clientDetailsRepository.deleteById(id);

        return true;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getClientWeeklyAvailability(Long clientId) {
        List<WeeklyAvailability> availabilities = weeklyAvailabilityRepository.findByClientId(clientId);

        Map<String, Object> result = new HashMap<>();
        for (WeeklyAvailability availability : availabilities) {
            WeeklyAvailabilityDTO dto = convertToWeeklyAvailabilityDTO(availability);
            result.put(availability.getDayOfWeek().toString(), dto);
        }

        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getClientBookingsForDate(Long clientId, String dateString) {
        LocalDate date = LocalDate.parse(dateString);
        Optional<BookedSlots> bookedSlots = bookedSlotsRepository.findByClientIdAndBookingDate(clientId, date);

        if (bookedSlots.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, Object> result = new HashMap<>();
        BookedSlots slots = bookedSlots.get();

        for (int hour = 0; hour < 24; hour++) {
            result.put("slot" + String.format("%02d", hour), slots.getSlotByHour(hour));
        }

        return result;
    }

//    @Transactional(readOnly = true)
//    public List<ClientPaymentDTO> getClientPayments(Long clientId) {
//        return clientPaymentRepository.findByClientId(clientId)
//                .stream()
//                .map(this::convertToClientPaymentDTO)
//                .collect(Collectors.toList());
//    }

//    @Transactional
//    public Optional<ClientPaymentDTO> updateClientPayment(Long paymentId, ClientPaymentDTO paymentDTO) {
//        Optional<ClientPayment> existingPayment = clientPaymentRepository.findById(paymentId);
//        if (existingPayment.isEmpty()) {
//            return Optional.empty();
//        }
//
//        ClientPayment payment = existingPayment.get();
//        payment.setYear(paymentDTO.getYear());
//        payment.setMonth(paymentDTO.getMonth());
//        payment.setAmount(paymentDTO.getAmount());
//        payment.setPaymentStatus(paymentDTO.getPaymentStatus());
//
//        ClientPayment updatedPayment = clientPaymentRepository.save(payment);
//        return Optional.of(convertToClientPaymentDTO(updatedPayment));
//    }

//    @Transactional(readOnly = true)
//    public Page<ClientPaymentDTO> getAllPayments(Pageable pageable) {
//        return clientPaymentRepository.findAll(pageable)
//                .map(this::convertToClientPaymentDTO);
//    }

//    @Transactional(readOnly = true)
//    public Optional<ClientPaymentDTO> getPaymentById(Long paymentId) {
//        return clientPaymentRepository.findById(paymentId)
//                .map(this::convertToClientPaymentDTO);
//    }

    // Helper methods
    private void createWeeklyAvailabilityRecords(Long clientId, Map<String, ClientCreationDTO.DayAvailabilityDTO> weeklyAvailability) {
        for (WeeklyAvailability.DayOfWeek day : WeeklyAvailability.DayOfWeek.values()) {
            WeeklyAvailability availability = new WeeklyAvailability();
            availability.setClientId(clientId);
            availability.setDayOfWeek(day);

            ClientCreationDTO.DayAvailabilityDTO dayAvailability =
                    weeklyAvailability.get(day.toString());

            if (dayAvailability != null) {
                availability.setIsAvailable(dayAvailability.getIsAvailable());
                availability.setOpeningTime(dayAvailability.getOpeningTime());
                availability.setClosingTime(dayAvailability.getClosingTime());
            } else {
                availability.setIsAvailable(false);
            }

            weeklyAvailabilityRepository.save(availability);
        }
    }

    private void updateWeeklyAvailabilityRecords(Long clientId, Map<String, ClientCreationDTO.DayAvailabilityDTO> weeklyAvailability) {
        List<WeeklyAvailability> existingAvailabilities = weeklyAvailabilityRepository.findByClientId(clientId);

        for (WeeklyAvailability existing : existingAvailabilities) {
            ClientCreationDTO.DayAvailabilityDTO dayAvailability =
                    weeklyAvailability.get(existing.getDayOfWeek().toString());

            if (dayAvailability != null) {
                existing.setIsAvailable(dayAvailability.getIsAvailable());
                existing.setOpeningTime(dayAvailability.getOpeningTime());
                existing.setClosingTime(dayAvailability.getClosingTime());
            } else {
                existing.setIsAvailable(false);
                existing.setOpeningTime(null);
                existing.setClosingTime(null);
            }

            weeklyAvailabilityRepository.save(existing);
        }
    }

    private void createInitialBookedSlotsRecords(Long clientId) {
        LocalDate startDate = LocalDate.now();

        // Create records for the next 30 days
        for (int i = 0; i < 30; i++) {
            LocalDate date = startDate.plusDays(i);
            createBookedSlotsForDate(clientId, date);
        }
    }

    private void createBookedSlotsForDate(Long clientId, LocalDate date) {
        // Get the day of week availability
        WeeklyAvailability.DayOfWeek dayOfWeek = WeeklyAvailability.DayOfWeek.valueOf(
                date.getDayOfWeek().toString()
        );

        Optional<WeeklyAvailability> availabilityOpt =
                weeklyAvailabilityRepository.findByClientIdAndDayOfWeek(clientId, dayOfWeek);

        BookedSlots bookedSlots = new BookedSlots();
        bookedSlots.setClientId(clientId);
        bookedSlots.setBookingDate(date);

        if (availabilityOpt.isPresent()) {
            WeeklyAvailability availability = availabilityOpt.get();
            setInitialSlotValues(bookedSlots, availability);
        } else {
            // If no availability set, mark all slots as not available
            setAllSlotsNotAvailable(bookedSlots);
        }

        bookedSlotsRepository.save(bookedSlots);
    }

    private void createInitialClientPaymentRecord(Long clientId) {
        paymentService.createInitialClientPaymentRecord(clientId);
    }

//    private void createInitialClientPaymentRecord(Long clientId) {
//        YearMonth currentMonth = YearMonth.now();
//        ClientPayment payment = new ClientPayment();
//        payment.setClientId(clientId);
//        payment.setYear(currentMonth.getYear());
//        payment.setMonth(currentMonth.getMonthValue());
//        payment.setAmount(BigDecimal.ZERO);
//        payment.setPaymentStatus(ClientPayment.PaymentStatus.PENDING);
//        clientPaymentRepository.save(payment);
//    }

    private void setInitialSlotValues(BookedSlots bookedSlots, WeeklyAvailability availability) {
        if (!availability.getIsAvailable() ||
                availability.getOpeningTime() == null ||
                availability.getClosingTime() == null) {
            setAllSlotsNotAvailable(bookedSlots);
            return;
        }

        LocalTime openingTime = availability.getOpeningTime();
        LocalTime closingTime = availability.getClosingTime();

        for (int hour = 0; hour < 24; hour++) {
            LocalTime currentHour = LocalTime.of(hour, 0);

            if (availability.isOpenAt(currentHour)) {
                bookedSlots.setSlotByHour(hour, "none"); // Available for booking
            } else {
                bookedSlots.setSlotByHour(hour, "not_available"); // Not available
            }
        }
    }

    private void setAllSlotsNotAvailable(BookedSlots bookedSlots) {
        for (int hour = 0; hour < 24; hour++) {
            bookedSlots.setSlotByHour(hour, "not_available");
        }
    }

    private void updateBookedSlotsBasedOnAvailability(Long clientId) {
        // Update all future booked slots based on new availability
        List<BookedSlots> futureBookings = bookedSlotsRepository
                .findByClientIdAndBookingDateGreaterThanEqual(clientId, LocalDate.now());

        for (BookedSlots booking : futureBookings) {
            WeeklyAvailability.DayOfWeek dayOfWeek = WeeklyAvailability.DayOfWeek.valueOf(
                    booking.getBookingDate().getDayOfWeek().toString()
            );

            Optional<WeeklyAvailability> availabilityOpt =
                    weeklyAvailabilityRepository.findByClientIdAndDayOfWeek(clientId, dayOfWeek);

            if (availabilityOpt.isPresent()) {
                WeeklyAvailability availability = availabilityOpt.get();
                updateExistingBookingSlots(booking, availability);
            } else {
                setAllSlotsNotAvailable(booking);
            }

            bookedSlotsRepository.save(booking);
        }
    }

    private void updateExistingBookingSlots(BookedSlots bookedSlots, WeeklyAvailability availability) {
        if (!availability.getIsAvailable() ||
                availability.getOpeningTime() == null ||
                availability.getClosingTime() == null) {
            // Mark all slots as not available, but preserve existing bookings
            for (int hour = 0; hour < 24; hour++) {
                String currentValue = bookedSlots.getSlotByHour(hour);
                if ("none".equals(currentValue)) {
                    bookedSlots.setSlotByHour(hour, "not_available");
                }
                // Keep actual bookings (non-"none" and non-"not_available" values)
            }
            return;
        }

        LocalTime openingTime = availability.getOpeningTime();
        LocalTime closingTime = availability.getClosingTime();

        for (int hour = 0; hour < 24; hour++) {
            LocalTime currentHour = LocalTime.of(hour, 0);
            String currentValue = bookedSlots.getSlotByHour(hour);

            if (availability.isOpenAt(currentHour)) {
                // If it was not available and now is available, set to none
                if ("not_available".equals(currentValue)) {
                    bookedSlots.setSlotByHour(hour, "none");
                }
                // Keep existing bookings
            } else {
                // If it's now not available, mark accordingly
                if ("none".equals(currentValue)) {
                    bookedSlots.setSlotByHour(hour, "not_available");
                }
                // Keep existing bookings but they might need special handling
            }
        }
    }

    // DTO Conversion methods
    private ClientDetailsDTO convertToDTO(ClientDetails client) {
        ClientDetailsDTO dto = new ClientDetailsDTO();
        dto.setId(client.getId());
        dto.setName(client.getName());
        dto.setDescription(client.getDescription());
        dto.setAddress(client.getAddress());
        dto.setCity(client.getCity());
        dto.setState(client.getState());
        dto.setZipcode(client.getZipcode());
        dto.setLatitude(client.getLatitude());
        dto.setLongitude(client.getLongitude());
        dto.setPricePerSlot(client.getPricePerSlot());
        dto.setContactNumber(client.getContactNumber());
        dto.setEmail(client.getEmail());
        dto.setWebsite(client.getWebsite());
        dto.setAccountNumber(client.getAccountNumber());
        dto.setAccountType(client.getAccountType());
        dto.setBranch(client.getBranch());
        dto.setIfscCode(client.getIfscCode());
        dto.setUpiId(client.getUpiId());
        dto.setStatus(client.getStatus());
        dto.setCreatedAt(client.getCreatedAt());
        dto.setUpdatedAt(client.getUpdatedAt());

        // Parse image URLs
        try {
            if (client.getImageUrls() != null) {
                dto.setImageUrls(objectMapper.readValue(client.getImageUrls(), List.class));
            }
        } catch (JsonProcessingException e) {
            logger.error("Error parsing image URLs JSON", e);
        }

        // Load weekly availability
        Map<String, WeeklyAvailabilityDTO> weeklyAvailability = getClientWeeklyAvailability(client.getId())
                .entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> (WeeklyAvailabilityDTO) entry.getValue()
                ));
        dto.setWeeklyAvailability(weeklyAvailability);

        return dto;
    }

    private ClientDetails convertToClientEntity(ClientCreationDTO dto) {
        ClientDetails client = new ClientDetails();
        client.setName(dto.getName());
        client.setDescription(dto.getDescription());
        client.setAddress(dto.getAddress());
        client.setCity(dto.getCity());
        client.setState(dto.getState());
        client.setZipcode(dto.getZipcode());
        client.setLatitude(dto.getLatitude());
        client.setLongitude(dto.getLongitude());
        client.setPricePerSlot(dto.getPricePerSlot());
        client.setContactNumber(dto.getContactNumber());
        client.setEmail(dto.getEmail());
        client.setWebsite(dto.getWebsite());
        client.setAccountNumber(dto.getAccountNumber());
        client.setAccountType(dto.getAccountType());
        client.setBranch(dto.getBranch());
        client.setIfscCode(dto.getIfscCode());
        client.setUpiId(dto.getUpiId());

        // Convert image URLs to JSON
        try {
            if (dto.getImageUrls() != null) {
                client.setImageUrls(objectMapper.writeValueAsString(dto.getImageUrls()));
            }
        } catch (JsonProcessingException e) {
            logger.error("Error converting image URLs to JSON", e);
        }

        return client;
    }

    private WeeklyAvailabilityDTO convertToWeeklyAvailabilityDTO(WeeklyAvailability availability) {
        WeeklyAvailabilityDTO dto = new WeeklyAvailabilityDTO();
        dto.setAvailabilityId(availability.getAvailabilityId());
        dto.setDayOfWeek(availability.getDayOfWeek());
        dto.setIsAvailable(availability.getIsAvailable());
        dto.setOpeningTime(availability.getOpeningTime());
        dto.setClosingTime(availability.getClosingTime());
        dto.setCreatedAt(availability.getCreatedAt());
        dto.setUpdatedAt(availability.getUpdatedAt());
        return dto;
    }

    private CustomerDTO convertToCustomerDTO(ClientDetails client) {
        CustomerDTO dto = new CustomerDTO();
        dto.setId(client.getId());
        dto.setName(client.getName());
        dto.setCity(client.getCity());
        dto.setContactNumber(client.getContactNumber());
        dto.setStatus(client.getStatus());
        dto.setCreatedAt(client.getCreatedAt());
        dto.setUpdatedAt(client.getUpdatedAt());
        return dto;
    }
}