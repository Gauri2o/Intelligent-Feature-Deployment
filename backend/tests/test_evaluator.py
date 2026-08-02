from app.services.evaluator import evaluate_flag


class DummyFlag:
    def __init__(self, flag_key, enabled, default_value, environment_id):
        self.flag_key = flag_key
        self.enabled = enabled
        self.default_value = default_value
        self.environment_id = environment_id


class DummyQuery:
    def __init__(self, flag):
        self.flag = flag

    def filter(self, *args, **kwargs):
        return self

    def first(self):
        return self.flag


class DummyDB:
    def __init__(self, flag):
        self.flag = flag

    def query(self, model):
        return DummyQuery(self.flag)


def test_flag_found_enabled():
    flag = DummyFlag(
        "new_dashboard",
        True,
        "true",
        1,
    )

    db = DummyDB(flag)

    result = evaluate_flag(
        db,
        "new_dashboard",
        1,
    )

    assert result["enabled"] is True


def test_flag_not_found():
    db = DummyDB(None)

    result = evaluate_flag(
        db,
        "missing_flag",
        1,
    )

    assert result["enabled"] is False
    assert result["reason"] == "Flag not found"


def test_disabled_flag():
    flag = DummyFlag(
        "new_dashboard",
        False,
        "true",
        1,
    )

    db = DummyDB(flag)

    result = evaluate_flag(
        db,
        "new_dashboard",
        1,
    )

    assert result["enabled"] is False


def test_empty_user_context():
    flag = DummyFlag(
        "new_dashboard",
        True,
        "true",
        1,
    )

    db = DummyDB(flag)

    result = evaluate_flag(
        db,
        "new_dashboard",
        1,
        user_context={},
    )

    assert result["enabled"] is True