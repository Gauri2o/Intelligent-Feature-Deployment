from datetime import datetime, timezone

from app.db.database import SessionLocal

from app.models.evaluation_metric import (
    EvaluationMetric
)

from app.services.redis_client import (
    redis_client
)


# =====================================================
# FLUSH REDIS EVALUATION COUNTERS
# =====================================================

def flush_evaluation_metrics():

    db = SessionLocal()

    try:

        now = datetime.now(
            timezone.utc
        )

        current_hour = now.replace(
            minute=0,
            second=0,
            microsecond=0
        )


        pattern = (
            "evaluation_count:*"
        )


        keys = list(
            redis_client.scan_iter(
                match=pattern
            )
        )


        flushed = 0


        for key in keys:

            try:

                # Redis decode_responses=True,
                # so key is already a string.

                parts = key.rsplit(
                    ":",
                    1
                )

                if len(parts) != 2:
                    continue


                prefix_flag = parts[0]

                hour_string = parts[1]


                if not prefix_flag.startswith(
                    "evaluation_count:"
                ):
                    continue


                flag_key = prefix_flag[
                    len("evaluation_count:")
                :]


                metric_hour = datetime.strptime(
                    hour_string,
                    "%Y%m%d%H"
                ).replace(
                    tzinfo=timezone.utc
                )


                # Never flush the currently active hour.
                if metric_hour >= current_hour:
                    continue


                value = redis_client.get(
                    key
                )

                if value is None:
                    continue


                count = int(value)


                # =================================================
                # UPSERT
                # =================================================

                existing = (

                    db.query(
                        EvaluationMetric
                    )

                    .filter(
                        EvaluationMetric.flag_key
                        == flag_key
                    )

                    .filter(
                        EvaluationMetric.hour
                        == metric_hour
                    )

                    .first()

                )


                if existing:

                    existing.count = count

                else:

                    metric = EvaluationMetric(

                        flag_key=flag_key,

                        hour=metric_hour,

                        count=count

                    )

                    db.add(metric)


                db.commit()


                # =================================================
                # DELETE ONLY AFTER SUCCESSFUL DB WRITE
                # =================================================

                redis_client.delete(
                    key
                )


                flushed += 1


                print(
                    f"FLUSHED: "
                    f"{flag_key} "
                    f"{metric_hour} "
                    f"count={count}"
                )


            except Exception as e:

                db.rollback()

                print(
                    f"Failed to flush "
                    f"{key}: {e}"
                )


        print(
            f"Evaluation metrics flush "
            f"completed. "
            f"Rows flushed: {flushed}"
        )


    finally:

        db.close()


if __name__ == "__main__":

    flush_evaluation_metrics()