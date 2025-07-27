package org.example.dobroz.controller;


import org.example.dobroz.entity.Venue;
import org.example.dobroz.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/venues")
@CrossOrigin(origins = "*")  // You can restrict origins for security in production
public class VenueController {

    private final VenueRepository venueRepository;

    @Autowired
    public VenueController(VenueRepository venueRepository) {
        this.venueRepository = venueRepository;
    }

    @GetMapping
    public ResponseEntity<List<Venue>> getAllVenues() {
        List<Venue> venues = venueRepository.findAll();
        return ResponseEntity.ok(venues);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venue> getVenueById(@PathVariable Long id) {
        Optional<Venue> venue = venueRepository.findById(id);
        if (venue.isPresent()) {
            return ResponseEntity.ok(venue.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Venue> createVenue(@RequestBody Venue venue) {
        if (venue == null) {
            return ResponseEntity.badRequest().build();
        }
        Venue savedVenue = venueRepository.save(venue);
        return ResponseEntity.ok(savedVenue);
    }
}