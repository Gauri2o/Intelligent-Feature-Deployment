import time

from app.services.evaluator import evaluate_flag

from tests.test_evaluator import (
    DummyDB,
    DummyFlag,
    DummyEnvironment,
)


def test_evaluation_repeated_requests_are_fast():

    flag = DummyFlag(
        flag_key="load_test_flag",
        enabled=True,
        default_value="true",
        environment_id=1,
        rollout_percentage=0,
    )

    db = DummyDB(
        flag=flag,
        environment=DummyEnvironment(
            1,
            "Development",
        ),
    )

    start_time = time.perf_counter()

    results = []

    for _ in range(100):

        result = evaluate_flag(
            db=db,
            flag_key="load_test_flag",
            environment_id=1,
            user_context={
                "user_id": "load-test-user"
            },
        )

        results.append(result)

    elapsed = time.perf_counter() - start_time

    # Every evaluation should succeed
    assert len(results) == 100

    for result in results:
        assert result["flag_key"] == "load_test_flag"
        assert result["enabled"] is True
        assert result["environment_id"] == 1

    # Basic performance check
    assert elapsed < 1.0