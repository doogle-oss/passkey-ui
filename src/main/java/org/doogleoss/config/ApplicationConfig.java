package org.doogleoss.config;

import static io.smallrye.mutiny.vertx.UniHelper.toUni;

import io.smallrye.mutiny.Uni;
import io.vertx.config.ConfigRetrieverOptions;
import io.vertx.config.ConfigStoreOptions;
import io.vertx.core.json.JsonObject;
import io.vertx.mutiny.config.ConfigRetriever;
import io.vertx.mutiny.core.Vertx;
import java.util.List;
import java.util.stream.Stream;

/**
 * Profile-aware configuration loader. Loads application.yml then
 * application-{profile}.yml where profile is resolved from: 1) -Dvertx.profile 2)
 * VERTX_PROFILE 3) defaults to "local" The profile file is optional; if missing, only
 * application.yml is applied. System yml and environment variables override loaded
 * values.
 */
public final class ApplicationConfig {

  private ApplicationConfig() {
    // utility class
  }

  /** Load merged configuration from YAML files with overrides. */
  public static Uni<JsonObject> loadConfig(Vertx vertx) {
    List<String> profiles = resolveProfiles();

    ConfigRetrieverOptions options =
        new ConfigRetrieverOptions().addStore(yamlStore("application.yml", false));

    profiles.forEach(
        profile ->
            options.addStore(yamlStore("application-" + profile + ".yml", true)));

    options
        .addStore(new ConfigStoreOptions().setType("sys"))
        .addStore(new ConfigStoreOptions().setType("env"));

    ConfigRetriever cfgr = ConfigRetriever.create(vertx, options);
    var appConfig = cfgr.getDelegate().getConfig();
    return toUni(appConfig);
  }

  /** Resolve active profile(s) in priority order, defaulting to "local". */
  public static List<String> resolveProfiles() {
    String sys = System.getProperty("vertx.profile");
    if (sys != null && !sys.isBlank()) return splitProfiles(sys);
    String env = System.getenv("VERTX_PROFILE");
    if (env != null && !env.isBlank()) return splitProfiles(env);
    return List.of("local");
  }

  private static ConfigStoreOptions yamlStore(String path, boolean optional) {
    return new ConfigStoreOptions()
        .setType("file")
        .setFormat("yaml")
        .setOptional(optional)
        .setConfig(new JsonObject().put("path", path));
  }

  private static List<String> splitProfiles(String profiles) {
    return Stream.of(profiles.split(",")).map(String::trim).filter(p -> !p.isEmpty()).toList();
  }
}
