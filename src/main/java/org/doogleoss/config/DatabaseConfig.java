package org.doogleoss.config;

import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonObject;
import io.vertx.core.net.ClientSSLOptions;
import io.vertx.mutiny.core.Vertx;
import io.vertx.mutiny.pgclient.PgBuilder;
import io.vertx.mutiny.sqlclient.Pool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.RowSet;
import io.vertx.mutiny.sqlclient.SqlConnection;
import io.vertx.pgclient.PgConnectOptions;
import io.vertx.pgclient.SslMode;
import io.vertx.sqlclient.PoolOptions;
import java.util.function.Consumer;

/** Creates PostgreSQL pooled clients using configuration loaded by {@link ApplicationConfig}. */
public final class DatabaseConfig {

  private DatabaseConfig() {}

  /**
   * Load config (application.yml + application-{profile}.yml + overrides) and build a pooled
   * client.
   */
  public static Uni<Pool> createPool(Vertx vertx) {
    return ApplicationConfig.loadConfig(vertx).map(config -> createPoolFromConfig(vertx, config));
  }

  /**
   * Build a PgPool from a config object produced by {@link ApplicationConfig#loadConfig(Vertx)}.
   */
  public static Pool createPoolFromConfig(Vertx vertx, JsonObject config) {
    JsonObject db = config.getJsonObject("database", new JsonObject());
    JsonObject conn = db.getJsonObject("connection", new JsonObject());
    JsonObject pool = db.getJsonObject("pool", new JsonObject());

    PgConnectOptions connectOptions = new PgConnectOptions();
    // Ensure SSL options object exists before applying SSL mode
    connectOptions.setSslOptions(new ClientSSLOptions());
    applyIfPresent(connectOptions::setHost, conn.getString("host"));
    applyIfPresent(connectOptions::setDatabase, conn.getString("database"));
    applyIfPresent(connectOptions::setUser, conn.getString("user"));
    applyIfPresent(connectOptions::setPassword, conn.getString("password"));
    applyIfPresent(connectOptions::setPort, conn.getInteger("port"));
    applyIfPresent(connectOptions::setReconnectAttempts, conn.getInteger("reconnectAttempts"));
    applyIfPresent(connectOptions::setReconnectInterval, conn.getLong("reconnectInterval"));
    applyIfPresent(connectOptions::setSslMode, SslMode.of(conn.getString("sslmode")));

    PoolOptions poolOptions =
        new PoolOptions()
            .setMaxSize(pool.getInteger("maxSize", 20))
            .setMaxWaitQueueSize(pool.getInteger("maxWaitQueueSize", 100))
            .setName("pg-pool")
            .setShared(true);

    return PgBuilder.pool().with(poolOptions).connectingTo(connectOptions).using(vertx).build();
  }

  private static <T> void applyIfPresent(Consumer<T> setter, T value) {
    if (value != null) {
      setter.accept(value);
    }
  }

  /** Convenience helper to get a connection from the pool. */
  public static Uni<SqlConnection> getConnection(Pool pool) {
    return pool.getConnection();
  }

  /** Execute a single query using a pooled connection and close the connection afterward. */
  public static Uni<RowSet<Row>> executeQuery(Pool pool, String sql) {
    return pool.query(sql).execute();
  }
}
