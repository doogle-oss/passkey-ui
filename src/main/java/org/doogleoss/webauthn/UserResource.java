package org.doogleoss.webauthn;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.SecurityContext;

@Path("/api/users")
public class UserResource {

    @GET
    // @RolesAllowed("user")
    @Path("/me")
    public String me(@Context SecurityContext securityContext) {
        return securityContext.getUserPrincipal().getName();
    }

    @GET
    @Path("/{username}/webauthn/credentials")
    @Produces(MediaType.APPLICATION_JSON)
    public boolean passkeyExists(@PathParam("username") String username) {
        return !WebAuthnCredential.findByUsername(username).isEmpty();
    }
}