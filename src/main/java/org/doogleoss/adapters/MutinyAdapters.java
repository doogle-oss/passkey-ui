package org.doogleoss.adapters;

import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.subscription.Cancellable;
import io.vertx.core.Future;

public class MutinyAdapters {
  private MutinyAdapters() {}

  public static <T> Uni<T> toUni(Future<T> future) {
    return Uni.createFrom()
        .emitter(
            emitter -> {
              future.onSuccess(emitter::complete).onFailure(emitter::fail);
            });
  }

  public static <T> Cancellable uniSubscriber(Future<T> future) {
    return Uni.createFrom()
        .completionStage(future.toCompletionStage())
        .subscribe()
        .with(IO::println, err -> IO.println(err.getMessage()));
  }
}
