package org.doogleoss.routers;

import static io.smallrye.mutiny.vertx.UniHelper.toUni;

import io.vertx.mutiny.core.Vertx;
import io.vertx.mutiny.ext.auth.webauthn.WebAuthn;
import io.vertx.mutiny.ext.web.Router;
import io.vertx.mutiny.ext.web.handler.BodyHandler;
import io.vertx.mutiny.ext.web.handler.SessionHandler;
import io.vertx.mutiny.ext.web.handler.StaticHandler;
import io.vertx.mutiny.ext.web.handler.WebAuthnHandler;
import io.vertx.mutiny.ext.web.sstore.LocalSessionStore;
import org.doogleoss.config.InMemoryStore;

class WebAuthnRouter {
  private final Vertx vertx;

  public WebAuthnRouter(Vertx vertx) {
    this.vertx = vertx;
  }

  public Router build() {
    Router router = Router.router(vertx);
    router
        .route() // (1)
        .handler(StaticHandler.create());
    router.route().handler(BodyHandler.create());
    router
        .route() // (3)
        .handler(SessionHandler.create(LocalSessionStore.create(vertx)));

    InMemoryStore database = new InMemoryStore();

    WebAuthn webAuthN =
        WebAuthn.create(vertx)
            // where to load/update authenticators data
            .authenticatorFetcher(d -> toUni(database.fetcher(d)))
            .authenticatorUpdater(d -> toUni(database.updater(d)));

    WebAuthnHandler webAuthnHandler =
        WebAuthnHandler.create(webAuthN) // (4)
            // required callback
            .setupCallback(router.post("/webauthn/callback"))
            // optional register callback
            .setupCredentialsCreateCallback(router.post("/webauthn/register"))
            // optional login callback
            .setupCredentialsGetCallback(router.post("/webauthn/login"));

    router.route().handler(webAuthnHandler);

    router
        .route("/protected") // (5)
        .handler(ctx -> ctx.response().end("FIDO2 is Awesome!\n" + "No Password phishing here!\n"));
  }
}
