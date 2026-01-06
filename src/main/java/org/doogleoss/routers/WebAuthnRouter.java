package org.doogleoss.routers;

import static org.doogleoss.adapters.MutinyAdapters.uniSubscriber;

import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.webauthn4j.Authenticator;
import io.vertx.ext.auth.webauthn4j.RelyingParty;
import io.vertx.ext.auth.webauthn4j.WebAuthn4J;
import io.vertx.ext.auth.webauthn4j.WebAuthn4JOptions;
import io.vertx.mutiny.core.Vertx;
import io.vertx.mutiny.ext.web.Router;
import io.vertx.mutiny.ext.web.handler.BodyHandler;
import org.doogleoss.repository.WebCredentialRepository;

/** Registers WebAuthn endpoints expected by the frontend Webauthn.tsx. */
public class WebAuthnRouter {

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
                    .setRelyingParty(new RelyingParty().setName("Passkey Corporation")))
            .credentialStorage(this.credentialRepository);
  }

  public Router build() {
    Router router = Router.router(vertx);
    router.route().handler(BodyHandler.create());

    // GET /q/webauthn/register-options-challenge?username=...&displayName=...
    router
        .get("/q/webauthn/register-options-challenge")
        .handler(
            ctx -> {
              String username = ctx.request().getParam("username");
              String displayName = ctx.request().getParam("displayName");
              if (username == null || username.isEmpty()) {
                uniSubscriber(ctx.response().setStatusCode(400).getDelegate().end("username is required"));
                return;
              }
              // Use a single JsonObject with name, displayName, and optional icon per API
              this.webAuthn4J
                  .createCredentialsOptions(
                      new JsonObject()
                          .put("name", username)
                          .put("displayName", displayName == null ? username : displayName)
                          .put(
                              "icon",
                              "https://pics.example.com/00/p/aBjjjpqPb.png") // add if you have an
                                                                             // icon
                      )
                  .onSuccess(
                      (JsonObject json) ->
                          uniSubscriber(ctx.response()
                              .putHeader("content-type", "application/json")
                              .getDelegate()
                              .end(json.encode())))
                  .onFailure(
                      (Throwable err) -> uniSubscriber(ctx.response().setStatusCode(400).getDelegate().end(err.getMessage())));
            });

    // GET /q/webauthn/login-options-challenge?username=...
    router
        .get("/q/webauthn/login-options-challenge")
        .handler(
            ctx -> {
              String username = ctx.request().getParam("username");
              this.webAuthn4J
                  .getCredentialsOptions(username)
                  .onSuccess(
                      (JsonObject json) ->
                          uniSubscriber(ctx.response()
                              .putHeader("content-type", "application/json")
                              .getDelegate()
                              .end(json.encode())))
                  .onFailure(
                      (Throwable err) -> uniSubscriber(ctx.response().setStatusCode(400).getDelegate().end(err.getMessage())));
            });

    // POST /q/webauthn/register?username=...
    router
        .post("/q/webauthn/register")
        .handler(
            ctx -> {
              String username = ctx.request().getParam("username");
              JsonObject body = ctx.body().asJsonObject();
              if (username == null || username.isEmpty()) {
                uniSubscriber(ctx.response().setStatusCode(400).getDelegate().end("username is required"));
                return;
              }
              this.webAuthn4J
                  .authenticate(username, body)
                  .compose(authenticator -> credentialRepository.storeCredential(authenticator))
                  .onSuccess(res -> uniSubscriber(ctx.response().setStatusCode(201).getDelegate().end()))
                  .onFailure(
                      (Throwable err) -> uniSubscriber(ctx.response().setStatusCode(400).getDelegate().end(err.getMessage())));
            });

    // POST /q/webauthn/login
    router
        .post("/q/webauthn/login")
        .handler(
            ctx -> {
              JsonObject body = ctx.body().asJsonObject();
              this.webAuthn4J
                  .authenticate(body)
                  .onSuccess(
                      (Authenticator auth) ->
                          uniSubscriber(ctx.response()
                              .setStatusCode(200)
                              .putHeader("content-type", "application/json")
                              .getDelegate().end("{\"status\":\"ok\"}")))
                  .onFailure(
                      (Throwable err) -> uniSubscriber(ctx.response().setStatusCode(401).getDelegate().end(err.getMessage())));
            });

    return router;
  }
}
