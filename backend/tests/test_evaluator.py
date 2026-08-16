from app.services.evaluator import evaluate_flag


class DummyEnvironment:
    def __init__(self, environment_id, name="Development"):
        self.id = environment_id
        self.name = name


class DummyFlag:
    def __init__(
        self,
        flag_key,
        enabled,
        default_value,
        environment_id
    ):
        self.flag_key = flag_key
        self.enabled = enabled
        self.default_value = default_value
        self.environment_id = environment_id
        self.id = 1


class DummyQuery:
    def __init__(self, result):
        self.result = result

    def filter(self, *args, **kwargs):
        return self

    def first(self):
        return self.result

    def all(self):
        return []


class DummyDB:
    def __init__(
        self,
        flag=None,
        environment=None
    ):
        self.flag = flag
        self.environment = environment or DummyEnvironment(1)

    def query(self, model):

        model_name = model.__name__

        if model_name == "Environment":
            return DummyQuery(self.environment)

        if model_name == "Flag":
            return DummyQuery(self.flag)

        # No targeting rules for these tests
        return DummyQuery([])


# ---------------------------------------------------
# Test 1:
# Default value is returned when no rule matches
# ---------------------------------------------------

def test_default_value_when_no_rule_matches():

    flag = DummyFlag(
        flag_key="new_dashboard",
        enabled=True,
        default_value="true",
        environment_id=1,
    )

    db = DummyDB(
        flag=flag,
        environment=DummyEnvironment(1),
    )

    result = evaluate_flag(
        db=db,
        flag_key="new_dashboard",
        environment_id=1,
        user_context={"role": "user"},
    )

    assert result["enabled"] is True
    assert result["default_value"] == "true"
    assert result["environment_id"] == 1


# ---------------------------------------------------
# Test 2:
# Environment-level override works correctly
# ---------------------------------------------------

def test_environment_override():

    development_flag = DummyFlag(
        flag_key="new_dashboard",
        enabled=True,
        default_value="development",
        environment_id=1,
    )

    staging_flag = DummyFlag(
        flag_key="new_dashboard",
        enabled=False,
        default_value="staging",
        environment_id=2,
    )

    # Test Development
    db_development = DummyDB(
        flag=development_flag,
        environment=DummyEnvironment(
            1,
            "Development"
        ),
    )

    result_dev = evaluate_flag(
        db=db_development,
        flag_key="new_dashboard",
        environment_id=1,
    )

    assert result_dev["enabled"] is True
    assert result_dev["environment_id"] == 1

    # Test Staging
    db_staging = DummyDB(
        flag=staging_flag,
        environment=DummyEnvironment(
            2,
            "Staging"
        ),
    )

    result_staging = evaluate_flag(
        db=db_staging,
        flag_key="new_dashboard",
        environment_id=2,
    )

    assert result_staging["enabled"] is False


# ---------------------------------------------------
# Test 3:
# Disabled flag always returns false/default
# ---------------------------------------------------

def test_disabled_flag_returns_false():

    flag = DummyFlag(
        flag_key="new_dashboard",
        enabled=False,
        default_value="true",
        environment_id=1,
    )

    db = DummyDB(
        flag=flag,
        environment=DummyEnvironment(1),
    )

    result = evaluate_flag(
        db=db,
        flag_key="new_dashboard",
        environment_id=1,
    )

    assert result["enabled"] is False
    assert result["reason"] == "Feature disabled"


# ---------------------------------------------------
# Test 4:
# Empty/missing user context works
# ---------------------------------------------------

def test_empty_user_context():

    flag = DummyFlag(
        flag_key="new_dashboard",
        enabled=True,
        default_value="true",
        environment_id=1,
    )

    db = DummyDB(
        flag=flag,
        environment=DummyEnvironment(1),
    )

    # Empty user context
    result_empty = evaluate_flag(
        db=db,
        flag_key="new_dashboard",
        environment_id=1,
        user_context={},
    )

    assert result_empty["enabled"] is True

    # Missing user context
    result_missing = evaluate_flag(
        db=db,
        flag_key="new_dashboard",
        environment_id=1,
    )

    assert result_missing["enabled"] is True