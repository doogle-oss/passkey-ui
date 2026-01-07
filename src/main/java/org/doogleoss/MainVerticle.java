package org.doogleoss;

import static io.smallrye.mutiny.vertx.UniHelper.toUni;

import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.vertx.core.AbstractVerticle;
import io.vertx.core.json.jackson.DatabindCodec;
import io.vertx.core.logging.SLF4JLogDelegateFactory;
import io.vertx.mutiny.core.Vertx;
import io.vertx.mutiny.ext.web.Router;
import io.vertx.mutiny.ext.web.handler.FaviconHandler;
import io.vertx.mutiny.ext.web.handler.SessionHandler;
import io.vertx.mutiny.ext.web.sstore.LocalSessionStore;
import io.vertx.mutiny.sqlclient.Pool;
import org.doogleoss.config.DatabaseConfig;
import org.doogleoss.repository.UserRepository;
import org.doogleoss.routers.LuxeUserRouter;
import org.doogleoss.service.UserService;
import org.doogleoss.routers.WebAuthnRouter;
import org.doogleoss.repository.WebCredentialRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MainVerticle extends AbstractVerticle {

  private static final Logger LOG = LoggerFactory.getLogger(MainVerticle.class);

  public MainVerticle() {
    System.out.println(System.getProperty("vertx.logger-delegate-factory-class-name"));
    LOG.info("Instanciating MainVerticle");
    System.setProperty(
        "vertx.logger-delegate-factory-class-name",
        SLF4JLogDelegateFactory.class.getName()
    );
  }

  static {
    DatabindCodec.mapper().registerModule(new JavaTimeModule());
    DatabindCodec.mapper().disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
  }

  private Pool pool;
  private UserRepository userRepository;

//  static void main(String... args) {
//    var vertx = Vertx.vertx();
//    LOG.trace("Deploying MainVerticle");
//    toUni(vertx.getDelegate().deployVerticle(new MainVerticle()))
//        .subscribe()
//        .with(ok -> LOG.info("MainVerticle deployed"), err -> LOG.error("Deployment failed", err));
//  }

  @Override
  public Uni<Void> asyncStart() {
    LOG.trace("Starting MainVerticle asyncStart");
    return DatabaseConfig.createPool(vertx)
        .invoke(
            p -> {
              this.pool = p;
              this.userRepository = new UserRepository(p);
              LOG.trace("Database pool initialized and user repository created");
            })
        .flatMap(
            p -> {
              Router router = Router.router(vertx);
              router.route().handler(FaviconHandler.create(vertx));

              // add a session handler
              router.route().handler(SessionHandler.create(LocalSessionStore.create(vertx)));

              // New router for user service endpoints
              router
                  .route("/api/users/*")
                  .subRouter(new UserResource(vertx, new UserService(userRepository)).build());
              // Mount user routers under /api
              router
                  .route("/api/luxeusers/*")
                  .subRouter(new LuxeUserRouter(vertx, userRepository).build());

              // WebAuthn endpoints under /webauthn/* expected by frontend Webauthn.tsx
              router
                  .route("/webauthn/*")
                  .subRouter(new WebAuthnRouter(vertx, new WebCredentialRepository()).build());

              LOG.trace("Routers initialized, creating HTTP server");
              var server = vertx.createHttpServer().requestHandler(router);
              return toUni(server.getDelegate().listen(8080));
            })
        .invoke(
            http -> {
              LOG.info("HTTP server started on port {}", 8080);
              IO.println("HTTP server started on port 8080");
            })
        .replaceWithVoid()
        .onFailure()
        .invoke(
            err -> {
              LOG.error("Failed to start HTTP server", err);
              System.err.println("Failed to start HTTP server: " + err.getMessage());
            });
  }

  @Override
  public Uni<Void> asyncStop() {
    if (pool != null) {
      LOG.trace("Closing database pool");
      return pool.close();
    }
    return Uni.createFrom().voidItem();
  }
}
