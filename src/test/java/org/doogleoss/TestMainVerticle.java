package org.doogleoss;

import io.vertx.core.DeploymentOptions;
import io.vertx.core.Vertx;
import io.vertx.junit5.VertxExtension;
import io.vertx.junit5.VertxTestContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.Random;

@ExtendWith(VertxExtension.class)
public class TestMainVerticle {

  @BeforeEach
  void deploy_verticle(Vertx vertx, VertxTestContext testContext) {
    int port = 20000 + new Random().nextInt(10000);
    DeploymentOptions opts = new DeploymentOptions().setConfig(new io.vertx.core.json.JsonObject().put("http.port", port));
    vertx.deployVerticle(new MainVerticle(), opts)
      .onComplete(testContext.succeeding(id -> testContext.completeNow()));
  }

  @AfterEach
  void tearDown(Vertx vertx, VertxTestContext testContext) {
    vertx.close().onComplete(testContext.succeedingThenComplete());
  }

  @Test
  void verticle_deployed(Vertx vertx, VertxTestContext testContext) throws Throwable {
    testContext.completeNow();
  }
}
