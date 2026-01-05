package org.doogleoss;

import static io.smallrye.mutiny.vertx.UniHelper.toUni;

import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.vertx.core.AbstractVerticle;
import io.vertx.core.json.jackson.DatabindCodec;
import io.vertx.mutiny.core.Vertx;
import io.vertx.mutiny.ext.web.Router;
import io.vertx.mutiny.sqlclient.Pool;
import org.doogleoss.config.DatabaseConfig;
import org.doogleoss.repository.UserRepository;
import org.doogleoss.routers.LuxeUserRouter;
import org.doogleoss.service.UserService;

public class MainVerticle extends AbstractVerticle {

  static {
    DatabindCodec.mapper().registerModule(new JavaTimeModule());
    DatabindCodec.mapper().disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
  }

  private Pool pool;
  private UserRepository userRepository;

  static void main(String... args) {
    var vertx = Vertx.vertx();
    IO.println("Deployment Starting");
    toUni(vertx.getDelegate().deployVerticle(new MainVerticle())).subscribe().with(ok -> {});
    IO.println("Deployment completed");
  }

  @Override
  public Uni<Void> asyncStart() {
    return DatabaseConfig.createPool(vertx)
        .invoke(
            p -> {
              this.pool = p;
              this.userRepository = new UserRepository(p);
            })
        .flatMap(
            p -> {
              Router router = Router.router(vertx);
              // New router for user service endpoints
              router.route("/api/users/*")
                  .subRouter(new UserResource(vertx, new UserService(userRepository)).build());
              // Mount user routers under /api
              router.route("/api/luxeusers/*").subRouter(new LuxeUserRouter(vertx, userRepository).build());


              var server = vertx.createHttpServer().requestHandler(router);
              return toUni(server.getDelegate().listen(8080));
            })
        .invoke(http -> IO.println("HTTP server started on port 8080"))
        .replaceWithVoid()
        .onFailure()
        .invoke(err -> System.err.println("Failed to start HTTP server: " + err.getMessage()));
  }

  @Override
  public Uni<Void> asyncStop() {
    if (pool != null) {
      return pool.close();
    }
    return Uni.createFrom().voidItem();
  }
}
