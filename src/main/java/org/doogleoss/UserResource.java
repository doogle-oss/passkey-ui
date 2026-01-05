package org.doogleoss;

import static org.doogleoss.adapters.MutinyAdapters.uniSubscriber;

import io.smallrye.mutiny.subscription.Cancellable;
import io.vertx.core.json.Json;
import io.vertx.mutiny.core.Vertx;
import io.vertx.mutiny.ext.web.Router;
import io.vertx.mutiny.ext.web.RoutingContext;
import io.vertx.mutiny.ext.web.handler.BodyHandler;
import org.doogleoss.dto.LoginRequest;
import org.doogleoss.dto.UserRegistrationRequest;
import org.doogleoss.service.UserService;

public class UserResource {

  private final Vertx vertx;
  private final UserService userService;

  public UserResource(Vertx vertx, UserService userService) {
    this.vertx = vertx;
    this.userService = userService;
  }

  /** Build a sub-router exposing user endpoints. */
  public Router build() {
    Router router = Router.router(vertx);
    router.route().handler(BodyHandler.create());

    router.post("/register").handler(this::registerUser);
    router.post("/login").handler(this::loginUser);
    router.get("/me").handler(this::getCurrentUser);
    router.get("/:username").handler(this::getUserById);
    router.put("/:id").handler(this::updateUser);
    router.get("/username/:username").handler(this::getUserByUsername);

    return router;
  }

  private void registerUser(RoutingContext ctx) {
    UserRegistrationRequest req = ctx.body().asPojo(UserRegistrationRequest.class);
    userService
        .registerUser(req)
        .subscribe()
        .with(
            user -> sendJson(ctx, 201, user),
            err -> handleError(ctx, err, 400, "Registration failed"));
  }

  private void loginUser(RoutingContext ctx) {
    LoginRequest req = ctx.body().asPojo(LoginRequest.class);
    userService
        .loginUser(req)
        .subscribe()
        .with(user -> sendJson(ctx, 200, user), err -> handleError(ctx, err, 401, "Login failed"));
  }

  private void getCurrentUser(RoutingContext ctx) {
    if (ctx.user() == null || ctx.user().principal() == null) {
      sendError(ctx, 401, "Unauthorized");
      return;
    }
    String username = ctx.user().principal().getString("username");
    userService
        .getUserByUsername(username)
        .subscribe()
        .with(
            user -> sendJson(ctx, 200, user), err -> handleError(ctx, err, 404, "User not found"));
  }

  private void getUserById(RoutingContext ctx) {
    try {
      var username = ctx.pathParam("username");
      userService
          .getUserByUsername(username)
          .subscribe()
          .with(
              user -> sendJson(ctx, 200, user),
              err -> handleError(ctx, err, 404, "User not found"));
    } catch (NumberFormatException nfe) {
      sendError(ctx, 400, "Invalid user id");
    }
  }

  private void getUserByUsername(RoutingContext ctx) {
    String username = ctx.pathParam("username");
    userService
        .getUserByUsername(username)
        .subscribe()
        .with(
            user -> sendJson(ctx, 200, user), err -> handleError(ctx, err, 404, "User not found"));
  }

  private void updateUser(RoutingContext ctx) {
    try {
      Long id = Long.valueOf(ctx.pathParam("id"));
      UserRegistrationRequest req = ctx.body().asPojo(UserRegistrationRequest.class);
      userService
          .updateUser(id, req)
          .subscribe()
          .with(
              user -> sendJson(ctx, 200, user),
              err -> handleError(ctx, err, 404, "Failed to update user"));
    } catch (NumberFormatException nfe) {
      sendError(ctx, 400, "Invalid user id");
    }
  }

  private <T> Cancellable sendJson(RoutingContext ctx, int status, T payload) {
    if (payload == null || payload instanceof Void) {
      return uniSubscriber(ctx.response().setStatusCode(status).getDelegate().end());
    }
    return uniSubscriber(
        ctx.response()
            .setStatusCode(status)
            .putHeader("content-type", "application/json")
            .getDelegate()
            .end(Json.encode(payload)));
  }

  private void sendError(RoutingContext ctx, int status, String message) {
    sendJson(ctx, status, new ErrorResponse(message));
  }

  private void handleError(
      RoutingContext ctx, Throwable err, int defaultStatus, String fallbackMessage) {
    int status = err instanceof IllegalArgumentException ? defaultStatus : 500;
    String message = err.getMessage() != null ? err.getMessage() : fallbackMessage;
    sendJson(ctx, status, new ErrorResponse(message));
  }

  // Simple error payload
  public static class ErrorResponse {
    public String error;

    public ErrorResponse(String error) {
      this.error = error;
    }

    public ErrorResponse() {}
  }
}
