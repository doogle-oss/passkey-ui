package org.doogleoss;

import org.doogleoss.dto.LoginRequest;
import org.doogleoss.dto.UserRegistrationRequest;
import org.doogleoss.dto.UserResponse;
import org.doogleoss.service.UserService;

import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {
    
    @Inject
    UserService userService;
    
    @POST
    @Path("/register")
    @PermitAll
    public Response registerUser(UserRegistrationRequest request) {
        try {
            UserResponse user = userService.registerUser(request);
            return Response.status(Response.Status.CREATED).entity(user).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(e.getMessage()))
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("Registration failed: " + e.getMessage()))
                .build();
        }
    }
    
    @POST
    @Path("/login")
    @PermitAll
    public Response loginUser(LoginRequest request) {
        try {
            UserResponse user = userService.loginUser(request);
            return Response.ok(user).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(new ErrorResponse(e.getMessage()))
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("Login failed: " + e.getMessage()))
                .build();
        }
    }
    
    @GET
    @Path("/me")
    // @RolesAllowed("user")
    public Response getCurrentUser(@Context SecurityContext ctx) {
        try {
            String username = ctx.getUserPrincipal().getName();
            UserResponse user = userService.getUserByUsername(username);
            return Response.ok(user).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage()))
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("Failed to fetch user: " + e.getMessage()))
                .build();
        }
    }
    
    @GET
    @Path("/{id}")
    // @RolesAllowed("user")
    public Response getUserById(@PathParam("id") Long id) {
        try {
            UserResponse user = userService.getUserById(id);
            return Response.ok(user).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage()))
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("Failed to fetch user: " + e.getMessage()))
                .build();
        }
    }
    
    @PUT
    @Path("/{id}")
    // @RolesAllowed("user")
    public Response updateUser(@PathParam("id") Long id, UserRegistrationRequest request) {
        try {
            UserResponse user = userService.updateUser(id, request);
            return Response.ok(user).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage()))
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("Failed to update user: " + e.getMessage()))
                .build();
        }
    }
    
    // Helper class for error responses
    public static class ErrorResponse {
        public String error;
        
        public ErrorResponse(String error) {
            this.error = error;
        }
        
        public ErrorResponse() {}
    }
}
