package org.example.dobroz.controller;



import org.example.dobroz.entity.Booking;
import org.example.dobroz.entity.Venue;
import org.example.dobroz.repository.BookingRepository;
import org.example.dobroz.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

        import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private VenueRepository venueRepository;

    // ✅ Get all bookings (as BookingResponse with venue name)
    @GetMapping
    public List<BookingResponse> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream().map(BookingResponse::from).collect(Collectors.toList());
    }

    // ✅ Create new booking
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest bookingRequest) {
        Optional<Venue> venueOpt = venueRepository.findById(bookingRequest.getVenueId());

        if (venueOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid venue ID");
        }

        try {
            LocalDateTime startTime = LocalDateTime.parse(bookingRequest.getDate() + "T" + bookingRequest.getStartTime());
            LocalDateTime endTime = LocalDateTime.parse(bookingRequest.getDate() + "T" + bookingRequest.getEndTime());

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
            e.printStackTrace(); // ✅ For debugging
            return ResponseEntity.badRequest().body("Invalid date/time format or unexpected error.");
        }
    }
    @PatchMapping("/{id}/cancel")
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


    // ✅ DTO for request
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

    // ✅ DTO for response (with venue name)
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

        // Getters and setters
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
}
