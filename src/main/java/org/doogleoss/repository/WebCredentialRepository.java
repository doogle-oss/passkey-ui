package org.doogleoss.repository;

import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.webauthn4j.Authenticator;
import io.vertx.ext.auth.webauthn4j.CredentialStorage;
import io.vertx.mutiny.sqlclient.Pool;
import io.vertx.sqlclient.Row;
import io.vertx.sqlclient.Tuple;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class WebCredentialRepository implements CredentialStorage {

  private static final Logger LOG = LoggerFactory.getLogger(WebCredentialRepository.class);

  private final Pool pool;

  public WebCredentialRepository(Pool pool) {
    this.pool = pool;
  }

  private Authenticator mapRow(Row row) {
    LOG.info("mapping row to Authenticator Object for user {}", row.getString("username"));
    JsonObject payload = row.getJsonObject("authenticator");
    // Ensure essential identifiers are present in payload before constructing
    if (!payload.containsKey("credID")) {
      payload.put("credID", row.getString("credential_id"));
    }
    if (!payload.containsKey("username")) {
      payload.put("username", row.getString("username"));
    }
    // Prefer counter from column if present
    Long counter = row.getLong("counter");
    if (counter != null) {
      payload.put("counter", counter);
    }
    return new Authenticator(payload);
  }

  private JsonObject toPayload(Authenticator authenticator) {
    LOG.info(
        "Converting to JSON Object form of Authenticator username: {}",
        authenticator.getUsername());
    return authenticator.toJson();
  }

  @Override
  public Future<List<Authenticator>> find(String userName, String credentialId) {
    LOG.info(
        "Finding List of Matching Authenticator for username: {} and credentialId {}",
        userName,
        credentialId);
    String sql =
        """
            SELECT credential_id, username, authenticator, counter
            FROM webauthn_credential
            WHERE ("username" = $1 OR $1 IS NULL) AND (credential_id = $2 OR $2 IS NULL)
            """;
    return pool.getDelegate()
        .preparedQuery(sql)
        .execute(Tuple.of(userName, credentialId))
        .map(
            rs -> {
              List<Authenticator> list = new ArrayList<>();
              for (Row row : rs) {
                list.add(mapRow(row));
              }
              return list;
            });
  }

  @Override
  public Future<Void> storeCredential(Authenticator authenticator) {
    LOG.info("Persisting Authenticator username: {} with counter value {}", authenticator.getUsername(),
        authenticator.getCounter());
    String sql =
        """
            INSERT INTO webauthn_credential (username, credential_id, authenticator, counter)
            VALUES ($1,$2,$3::jsonb,$4)
            """;
    JsonObject payload = toPayload(authenticator);
    return pool.getDelegate()
        .preparedQuery(sql)
        .execute(
            Tuple.of(
                authenticator.getUsername(),
                authenticator.getCredID(),
                payload,
                authenticator.getCounter()))
        .mapEmpty();
  }

  @Override
  public Future<Void> updateCounter(Authenticator authenticator) {
    LOG.info("Updating counter for Authenticator username: {}, current counter {}", authenticator.getUsername(),
        authenticator.getCounter());
    String sql =
        """
            UPDATE webauthn_credential
            SET counter = $1, authenticator = jsonb_set(authenticator::jsonb, '{counter}', to_jsonb($1::bigint)), updated_at = now()
            WHERE credential_id = $2
            """;
    return pool.getDelegate()
        .preparedQuery(sql)
        .execute(Tuple.of(authenticator.getCounter(), authenticator.getCredID()))
        .mapEmpty();
  }
}
