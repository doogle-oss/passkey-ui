package org.doogleoss.repository;

import org.doogleoss.entity.LuxeUser;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class UserRepository implements PanacheRepository<LuxeUser> {
    
    public LuxeUser findByUsername(String username) {
        return find("username", username).firstResult();
    }
    
    public LuxeUser findByEmail(String email) {
        return find("email", email).firstResult();
    }
    
    public boolean existsByUsername(String username) {
        return find("username", username).count() > 0;
    }
    
    public boolean existsByEmail(String email) {
        return find("email", email).count() > 0;
    }
}
