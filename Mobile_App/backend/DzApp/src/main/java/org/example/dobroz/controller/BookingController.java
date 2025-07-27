package org.example.dobroz.controller;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.example.dobroz.entity.Booking;
import org.example.dobroz.entity.Venue;
import org.example.dobroz.repository.BookingRepository;
import org.example.dobroz.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private VenueRepository venueRepository;

    // Get all bookings
    @GetMapping("/bookings")
    public List<BookingResponse> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream().map(BookingResponse::from).collect(Collectors.toList());
    }

    // Create new booking
    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest bookingRequest) {
        Optional<Venue> venueOpt = venueRepository.findById(bookingRequest.getVenueId());

        if (venueOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid venue ID");
        }

        try {
            LocalDateTime startTime = LocalDateTime.parse(bookingRequest.getDate() + "T" + bookingRequest.getStartTime());
            LocalDateTime endTime = LocalDateTime.parse(bookingRequest.getDate() + "T" + bookingRequest.getEndTime());

            // Validate that endTime is after startTime
            if (!endTime.isAfter(startTime)) {
                return ResponseEntity.badRequest().body("End time must be after start time");
            }

            // Check for overlapping bookings
            List<Booking> existingBookings = bookingRepository.findByVenueIdAndDate(
                    bookingRequest.getVenueId(),
                    LocalDate.parse(bookingRequest.getDate())
            );

            for (Booking booking : existingBookings) {
                if (booking.getStatus().equalsIgnoreCase("Confirmed") &&
                        !(endTime.isBefore(booking.getStartTime()) || startTime.isAfter(booking.getEndTime()))) {
                    return ResponseEntity.badRequest().body("Selected time slot is already booked");
                }
            }

            Booking booking = new Booking(
                    venueOpt.get(),
                    bookingRequest.getUserEmail(),
                    startTime,
                    endTime,
                    bookingRequest.getStatus()
            );

            Booking savedBooking = bookingRepository.save(booking);
            return ResponseEntity.ok(BookingResponse.from(savedBooking));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Invalid date/time format or unexpected error: " + e.getMessage());
        }
    }

    // Cancel booking
    @PatchMapping("/bookings/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable String id) {
        Optional<Booking> bookingOpt = bookingRepository.findById(Long.valueOf(id));

        if (bookingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Booking booking = bookingOpt.get();

        if ("Cancelled".equalsIgnoreCase(booking.getStatus())) {
            return ResponseEntity.badRequest().body("Booking is already cancelled.");
        }

        booking.setStatus("Cancelled");
        bookingRepository.save(booking);

        return ResponseEntity.ok("Booking cancelled successfully");
    }

    // Get bookings by user email
    @GetMapping("/bookings/user")
    public ResponseEntity<?> getBookingsByUserEmail(@RequestParam String email) {
        List<Booking> bookings = bookingRepository.findByUserEmail(email);
        return ResponseEntity.ok(bookings.stream().map(BookingResponse::from).collect(Collectors.toList()));
    }


    // Get available time slots for a venue and date
    @GetMapping("/venues/{venueId}/slots")
    public ResponseEntity<?> getAvailableSlots(@PathVariable Long venueId, @RequestParam String date) {
        try {
            Optional<Venue> venueOpt = venueRepository.findById(venueId);
            if (venueOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Invalid venue ID");
            }

            LocalDate localDate = LocalDate.parse(date);
            List<Booking> bookings = bookingRepository.findByVenueIdAndDate(venueId, localDate);

            // Generate 1-hour slots from 9:00 to 17:00
            // TODO: Consider making operating hours configurable per venue
            List<TimeSlot> slots = new ArrayList<>();
            LocalTime start = LocalTime.of(9, 0);
            LocalTime end = LocalTime.of(17, 0);

            while (start.isBefore(end)) {
                LocalTime slotEnd = start.plusHours(1);
                boolean isAvailable = true;

                for (Booking booking : bookings) {
                    if (booking.getStatus().equalsIgnoreCase("Confirmed")) {
                        LocalTime bookingStart = booking.getStartTime().toLocalTime();
                        LocalTime bookingEnd = booking.getEndTime().toLocalTime();
                        if (!(slotEnd.isBefore(bookingStart) || start.isAfter(bookingEnd))) {
                            isAvailable = false;
                            break;
                        }
                    }
                }

                slots.add(new TimeSlot(
                        start.toString(),
                        slotEnd.toString(),
                        isAvailable
                ));

                start = slotEnd;
            }

            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Invalid date format or unexpected error: " + e.getMessage());
        }
    }

    // DTO for request
    public static class BookingRequest {
        private Long venueId;
        private String userEmail;
        private String date;
        private String startTime;
        private String endTime;
        private String status;

        public Long getVenueId() { return venueId; }
        public void setVenueId(Long venueId) { this.venueId = venueId; }

        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }

        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    // DTO for response
    public static class BookingResponse {
        private String id;
        private String userEmail;
        private String date;
        private String startTime;
        private String endTime;
        private String status;
        private String venueName;

        public static BookingResponse from(Booking booking) {
            BookingResponse response = new BookingResponse();
            response.id = String.valueOf(booking.getId());
            response.userEmail = booking.getUserEmail();
            response.date = booking.getStartTime().toLocalDate().toString();
            response.startTime = booking.getStartTime().toLocalTime().toString();
            response.endTime = booking.getEndTime().toLocalTime().toString();
            response.status = booking.getStatus();
            response.venueName = booking.getVenue().getName();
            return response;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }

        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getVenueName() { return venueName; }
        public void setVenueName(String venueName) { this.venueName = venueName; }
    }

    // DTO for time slots
    public static class TimeSlot {
        private String startTime;
        private String endTime;
        private boolean isAvailable;

        public TimeSlot(String startTime, String endTime, boolean isAvailable) {
            this.startTime = startTime;
            this.endTime = endTime;
            this.isAvailable = isAvailable;
        }

        @JsonProperty("startTime")
        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }

        @JsonProperty("endTime")
        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }

        @JsonProperty("isAvailable")
        public boolean isAvailable() { return isAvailable; }
        public void setAvailable(boolean available) { this.isAvailable = available; }
    }
}