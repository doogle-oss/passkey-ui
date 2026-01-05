package org.doogleoss.repository;

import static io.smallrye.mutiny.vertx.UniHelper.toUni;

import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.core.Vertx;
import io.vertx.mutiny.sqlclient.Pool;
import io.vertx.sqlclient.Row;
import io.vertx.sqlclient.RowSet;
import io.vertx.sqlclient.Tuple;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.doogleoss.config.DatabaseConfig;
import org.doogleoss.entity.LuxeUser;

public class UserRepository {
  private final Pool pool;

  public UserRepository(Pool pool) {
    this.pool = pool;
  }

  /** Factory helper to build repository using DatabaseConfig pooled client. */
  public static Uni<UserRepository> create(Vertx vertx) {
    return DatabaseConfig.createPool(vertx).map(UserRepository::new);
  }

  public Uni<LuxeUser> findById(Long id) {
    String sql =
        "SELECT id, username, firstname, lastname, email, password, created_at, updated_at FROM luxe_user WHERE id = $1";
    return toUni(
        pool.preparedQuery(sql)
            .getDelegate()
            .execute(Tuple.of(id))
            .map(o -> this.mapSingle((RowSet<Row>) o)));
  }

  public Uni<LuxeUser> findByUsername(String username) {
    String sql =
        "SELECT id, username, firstname, lastname, email, password, created_at, updated_at FROM luxe_user WHERE username = $1";
    return toUni(
        pool.preparedQuery(sql)
            .getDelegate()
            .execute(Tuple.of(username))
            .map(o -> this.mapSingle((RowSet<Row>) o)));
  }

  public Uni<LuxeUser> findByEmail(String email) {
    String sql =
        "SELECT id, username, firstname, lastname, email, password, created_at, updated_at FROM luxe_user WHERE email = $1";
    return toUni(
        pool.preparedQuery(sql)
            .getDelegate()
            .execute(Tuple.of(email))
            .map(o -> this.mapSingle((RowSet<Row>) o)));
  }

  public Uni<Boolean> existsByUsername(String username) {
    String sql = "SELECT COUNT(*) AS cnt FROM luxe_user WHERE username = $1";
    return toUni(
        pool.preparedQuery(sql)
            .getDelegate()
            .execute(Tuple.of(username))
            .map(rows -> ((RowSet<Row>) rows).iterator().next().getLong("cnt") > 0));
  }

  public Uni<Boolean> existsByEmail(String email) {
    String sql = "SELECT COUNT(*) AS cnt FROM luxe_user WHERE email = $1";
    return toUni(
        pool.preparedQuery(sql)
            .getDelegate()
            .execute(Tuple.of(email))
            .map(rows -> ((RowSet<Row>) rows).iterator().next().getLong("cnt") > 0));
  }

  public Uni<LuxeUser> create(LuxeUser user) {
    String sql =
        "INSERT INTO luxe_user (username, firstname, lastname, email, password, created_at, updated_at) "
            + "VALUES ($1, $2, $3, $4, $5, $6, $7) "
            + "RETURNING id, username, firstname, lastname, email, password, created_at, updated_at";
    return toUni(
        pool.preparedQuery(sql)
            .getDelegate()
            .execute(
                Tuple.of(
                    user.username(),
                    user.firstName(),
                    user.lastName(),
                    user.email(),
                    user.password(),
                    user.createdAt(),
                    user.updatedAt()))
            .map(o -> this.mapSingle((RowSet<Row>) o)));
  }

  public Uni<LuxeUser> update(LuxeUser user) {
    if (user.id() == null) {
      return Uni.createFrom().failure(new IllegalArgumentException("User id required for update"));
    }
    String sql =
        "UPDATE luxe_user SET firstname = $1, lastname = $2, email = $3, password = $4, updated_at = $5 WHERE id = $6 "
            + "RETURNING id, username, firstname, lastname, email, password, created_at, updated_at";
    return toUni(
        pool.preparedQuery(sql)
            .getDelegate()
            .execute(
                Tuple.of(
                    user.firstName(),
                    user.lastName(),
                    user.email(),
                    user.password(),
                    user.updatedAt(),
                    user.id()))
            .map(o -> this.mapSingle((RowSet<Row>) o)));
  }

  private LuxeUser mapSingle(RowSet<Row> rows) {
    if (rows == null || rows.size() == 0) return null;
    return mapRow(rows.iterator().next());
  }

  private List<LuxeUser> mapMany(RowSet<Row> rows) {
    List<LuxeUser> result = new ArrayList<>();
    for (Row row : rows) {
      result.add(mapRow(row));
    }
    return result;
  }

  private LuxeUser mapRow(Row row) {
    return new LuxeUser(
        row.getLong("id"),
        row.getString("username"),
        row.getString("firstname"),
        row.getString("lastname"),
        row.getString("email"),
        row.getString("password"),
        row.getLocalDateTime("created_at"),
        row.getLocalDateTime("updated_at") != null
            ? row.getLocalDateTime("updated_at")
            : LocalDateTime.now());
  }
}
