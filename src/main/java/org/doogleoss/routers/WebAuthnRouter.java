package org.doogleoss.routers;

import io.vertx.core.http.Cookie;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.webauthn4j.RelyingParty;
import io.vertx.ext.auth.webauthn4j.WebAuthn4J;
import io.vertx.ext.auth.webauthn4j.WebAuthn4JOptions;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.WebAuthn4JHandler;
import io.vertx.mutiny.core.Vertx;
import io.vertx.mutiny.ext.web.Router;
import io.vertx.mutiny.ext.web.handler.BodyHandler;
import io.vertx.mutiny.ext.web.handler.SessionHandler;
import io.vertx.mutiny.ext.web.sstore.LocalSessionStore;
import org.doogleoss.repository.WebCredentialRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Registers WebAuthn endpoints expected by the frontend Webauthn.tsx. */
public class WebAuthnRouter {

  private static final Logger LOG = LoggerFactory.getLogger(WebAuthnRouter.class);
  private static final String COOKIE_NAME = "vertx-web.session";

  private final Vertx vertx;
  private final WebCredentialRepository credentialRepository;
  private final WebAuthn4J webAuthn4J;

  public WebAuthnRouter(Vertx vertx, WebCredentialRepository credentialRepository) {
    this.vertx = vertx;
    this.credentialRepository = credentialRepository;

    this.webAuthn4J =
        WebAuthn4J.create(
                this.vertx.getDelegate(),
                new WebAuthn4JOptions()
                    .setRelyingParty(new RelyingParty().setName("Passkey Corporation"))
                    // What kind of authentication do you want? do you care?
                    // # security keys
                    .setAuthenticatorAttachment(
                        io.vertx.ext.auth.webauthn4j.AuthenticatorAttachment.CROSS_PLATFORM)
                    // # fingerprint
                    .setAuthenticatorAttachment(
                        io.vertx.ext.auth.webauthn4j.AuthenticatorAttachment.PLATFORM)
                    .setUserVerification(io.vertx.ext.auth.webauthn4j.UserVerification.REQUIRED))
            // where to load or store the credentials
            .credentialStorage(this.credentialRepository);
  }

  public Router build() {
    Router router = Router.router(vertx);
    // parse the BODY
    router.post().handler(BodyHandler.create());

    // allow logout without passing through the WebAuthn handler
    router.post("/logout").getDelegate().handler(this::logout);
    // public check for existing passkey credentials by username
    router.get("/:username/creds").getDelegate().handler(this::passkeyExists);

    // security handler for WebAuthn endpoints
    WebAuthn4JHandler webAuthNHandler =
        WebAuthn4JHandler.create(webAuthn4J)
            .setOrigin("http://luxestore.localhost:3000")
            // required callback
            .setupCallback(router.getDelegate().post("/callback"))
            // optional register options callback
            .setupCredentialsCreateCallback(router.getDelegate().post("/register"))
            // optional login options callback
            .setupCredentialsGetCallback(router.getDelegate().post("/login"));



    // secure the remaining routes
    router.route().getDelegate().handler(webAuthNHandler);
//    router.route().getDelegate().failureHandler(this::failureHandler);

    return router;
  }

  private void failureHandler(RoutingContext ctx) {
    Throwable failure = ctx.failure();
    int statusCode = ctx.statusCode() > 0 ? ctx.statusCode() : 500;
    LOG.error(
        "WebAuthn handler error on {} {} with status {}",
        ctx.request().method(),
        ctx.request().path(),
        statusCode,
        failure);
    JsonObject errorPayload =
        new JsonObject()
            .put("error", failure != null ? failure.getMessage() : "Unknown error")
            .put("path", ctx.request().path())
            .put("status", statusCode);
    ctx.response()
        .setStatusCode(statusCode)
        .putHeader("Content-Type", "application/json")
        .end(errorPayload.encode());
  }

  /**
   * Endpoint for logout, redirects to the root URI
   *
   * @param ctx the current request
   */
  public void logout(RoutingContext ctx) {
    Cookie cookie = ctx.request().getCookie(COOKIE_NAME);
    if (cookie != null) {
      // Ensure path is set so browsers clear it
      cookie.setPath("/");
    }
    ctx.response().removeCookie(COOKIE_NAME);
    ctx.redirect("/");
  }

  /** Endpoint to check if passkey credentials exist for a given username. */
  private void passkeyExists(RoutingContext ctx) {
    String username = ctx.pathParam("username");
    if (username == null || username.isBlank()) {
      ctx.response().setStatusCode(400).end("false");
      return;
    }
    credentialRepository
        .find(username, null)
        .onComplete(
            ar -> {
              if (ar.succeeded()) {
                boolean exists = !ar.result().isEmpty();
                ctx.response().setStatusCode(200)
                    .putHeader("Content-Type", "application/json")
                    .end(String.valueOf(exists));
              } else {
                LOG.error("Failed to check credentials for {}", username, ar.cause());
                ctx.response().setStatusCode(500).end("false");
              }
            });
  }
}
