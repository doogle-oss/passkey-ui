package org.doogleoss.routers;

import static org.doogleoss.adapters.MutinyAdapters.uniSubscriber;

import io.vertx.core.json.JsonObject;
import io.vertx.mutiny.core.Vertx;
import io.vertx.mutiny.ext.web.Router;
import io.vertx.mutiny.ext.web.handler.BodyHandler;
import org.doogleoss.entity.LuxeUser;
import org.doogleoss.repository.UserRepository;

/** Registers HTTP routers for LuxeUser resources. */
public class LuxeUserRouter {

  private final Vertx vertx;
  private final UserRepository userRepository;

  public LuxeUserRouter(Vertx vertx, UserRepository userRepository) {
    this.vertx = vertx;
    this.userRepository = userRepository;
  }

  public Router build() {
    Router router = Router.router(vertx);
    router.route().handler(BodyHandler.create());

    // GET /users/username/:username
    router
        .get("/username/:username")
        .handler(
            ctx -> {
              String username = ctx.pathParam("username");
              userRepository
                  .findByUsername(username)
                  .subscribe()
                  .with(
                      user -> {
                        if (user == null) {
                          uniSubscriber(ctx.response().setStatusCode(404).getDelegate().end());
                        } else {
                          uniSubscriber(
                              ctx.response()
                                  .putHeader("content-type", "application/json")
                                  .getDelegate()
                                  .end(toJson(user).encode()));
                        }
                      },
                      err ->
                          uniSubscriber(
                              ctx.response()
                                  .setStatusCode(500)
                                  .getDelegate()
                                  .end(err.getMessage())));
            });

    // GET /users/email/:email
    router
        .get("/email/:email")
        .handler(
            ctx -> {
              String email = ctx.pathParam("email");
              userRepository
                  .findByEmail(email)
                  .subscribe()
                  .with(
                      user -> {
                        if (user == null) {
                          uniSubscriber(ctx.response().setStatusCode(404).getDelegate().end());
                        } else {
                          uniSubscriber(
                              ctx.response()
                                  .putHeader("content-type", "application/json")
                                  .getDelegate()
                                  .end(toJson(user).encode()));
                        }
                      },
                      failure ->
                          uniSubscriber(
                              ctx.response()
                                  .setStatusCode(500)
                                  .getDelegate()
                                  .end(failure.getMessage())));
            })
        .failureHandler(
            err -> uniSubscriber(err.response().setStatusCode(500).getDelegate().end()));

    // GET /users/exists/username/:username
    router
        .get("/exists/username/:username")
        .handler(
            ctx -> {
              String username = ctx.pathParam("username");
              userRepository
                  .existsByUsername(username)
                  .subscribe()
                  .with(
                      exists ->
                          uniSubscriber(
                              ctx.response()
                                  .putHeader("content-type", "application/json")
                                  .getDelegate()
                                  .end(new JsonObject().put("exists", exists).encode())),
                      err ->
                          uniSubscriber(
                              ctx.response()
                                  .setStatusCode(500)
                                  .getDelegate()
                                  .end(err.getMessage())));
            });

    // GET /users/exists/email/:email
    router
        .get("/exists/email/:email")
        .handler(
            ctx -> {
              String email = ctx.pathParam("email");
              userRepository
                  .existsByEmail(email)
                  .subscribe()
                  .with(
                      exists ->
                          uniSubscriber(
                              ctx.response()
                                  .putHeader("content-type", "application/json")
                                  .getDelegate()
                                  .end(new JsonObject().put("exists", exists).encode())),
                      err ->
                          uniSubscriber(
                              ctx.response()
                                  .setStatusCode(500)
                                  .getDelegate()
                                  .end(err.getMessage())));
            });
    return router;
  }

  private JsonObject toJson(LuxeUser user) {
    return new JsonObject()
        .put("id", user.id())
        .put("username", user.username())
        .put("firstName", user.firstName())
        .put("lastName", user.lastName())
        .put("email", user.email())
        .put("createdAt", user.createdAt() != null ? user.createdAt().toString() : null)
        .put("updatedAt", user.updatedAt() != null ? user.updatedAt().toString() : null);
  }
}
