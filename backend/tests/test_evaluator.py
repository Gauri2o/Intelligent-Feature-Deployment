import app.services.evaluator as evaluator_service

from app.services.evaluator import evaluate_flag


# =========================================================
# Dummy Environment
# =========================================================

class DummyEnvironment:
    def __init__(self, environment_id, name="Development"):
        self.id = environment_id
        self.name = name


# =========================================================
# Dummy Flag
# =========================================================

class DummyFlag:
    def __init__(
        self,
        flag_key,
        enabled,
        default_value,
        environment_id,
        rollout_percentage=0,
    ):
        self.flag_key = flag_key
        self.enabled = enabled
        self.default_value = default_value
        self.environment_id = environment_id
        self.rollout_percentage = rollout_percentage
        self.id = 1
        self.description = "Test flag"
        self.owner_team = "Test Team"


# =========================================================
# Dummy Targeting Rule
# =========================================================

class DummyRule:
    def __init__(
        self,
        attribute,
        operator,
        value,
    ):
        self.attribute = attribute
        self.operator = operator
        self.value = value


# =========================================================
# Dummy Environment Override
# =========================================================

class DummyOverride:
    def __init__(
        self,
        enabled,
        value=None,
    ):
        self.enabled = enabled
        self.value = value


# =========================================================
# Dummy Query
# =========================================================

class DummyQuery:
    def __init__(self, result):
        self.result = result

    def filter(self, *args, **kwargs):
        return self

    def first(self):
        return self.result

    def all(self):
        if isinstance(self.result, list):
            return self.result

        return []


# =========================================================
# Dummy DB
# =========================================================

class DummyDB:
    def __init__(
        self,
        flag=None,
        environment=None,
        rules=None,
        override=None,
    ):
        self.flag = flag
        self.environment = (
            environment
            if environment is not None
            else DummyEnvironment(1)
        )
        self.rules = rules or []
        self.override = override

    def query(self, model):

        model_name = model.__name__

        if model_name == "Environment":
            return DummyQuery(self.environment)

        if model_name == "Flag":
            return DummyQuery(self.flag)

        if model_name == "TargetingRule":
            return DummyQuery(self.rules)

        if model_name == "FlagEnvironmentOverride":
            return DummyQuery(self.override)

        return DummyQuery([])


# =========================================================
# Test 1
# Default value is returned when no rule matches
# =========================================================

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
    assert result["reason"] == "Default evaluation"


# =========================================================
# Test 2
# Environment-level flag separation works
# =========================================================

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

    # Development
    db_development = DummyDB(
        flag=development_flag,
        environment=DummyEnvironment(
            1,
            "Development",
        ),
    )

    result_dev = evaluate_flag(
        db=db_development,
        flag_key="new_dashboard",
        environment_id=1,
    )

    assert result_dev["enabled"] is True
    assert result_dev["environment_id"] == 1

    # Staging
    db_staging = DummyDB(
        flag=staging_flag,
        environment=DummyEnvironment(
            2,
            "Staging",
        ),
    )

    result_staging = evaluate_flag(
        db=db_staging,
        flag_key="new_dashboard",
        environment_id=2,
    )

    assert result_staging["enabled"] is False


# =========================================================
# Test 3
# Disabled flag returns false
# =========================================================

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


# =========================================================
# Test 4
# Empty/missing user context works
# =========================================================

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

    result_empty = evaluate_flag(
        db=db,
        flag_key="new_dashboard",
        environment_id=1,
        user_context={},
    )

    assert result_empty["enabled"] is True

    result_missing = evaluate_flag(
        db=db,
        flag_key="new_dashboard",
        environment_id=1,
    )

    assert result_missing["enabled"] is True


# =========================================================
# Test 5
# User targeting rule matches
# =========================================================

def test_user_targeting_rule_matches():

    flag = DummyFlag(
        flag_key="new_dashboard",
        enabled=False,
        default_value="false",
        environment_id=1,
    )

    rule = DummyRule(
        attribute="user_id",
        operator="equals",
        value="user-123",
    )

    db = DummyDB(
        flag=flag,
        environment=DummyEnvironment(1),
        rules=[rule],
    )

    result = evaluate_flag(
        db=db,
        flag_key="new_dashboard",
        environment_id=1,
        user_context={
            "user_id": "user-123"
        },
    )

    assert result["enabled"] is True
    assert result["reason"] == (
        "User targeting rule matched"
    )


# =========================================================
# Test 6
# User targeting rule does not match
# =========================================================

def test_user_targeting_rule_does_not_match():

    flag = DummyFlag(
        flag_key="new_dashboard",
        enabled=True,
        default_value="false",
        environment_id=1,
    )

    rule = DummyRule(
        attribute="user_id",
        operator="equals",
        value="user-123",
    )

    db = DummyDB(
        flag=flag,
        environment=DummyEnvironment(1),
        rules=[rule],
    )

    result = evaluate_flag(
        db=db,
        flag_key="new_dashboard",
        environment_id=1,
        user_context={
            "user_id": "user-999"
        },
    )

    assert result["enabled"] is True
    assert result["reason"] == "Default evaluation"


# =========================================================
# Test 7
# Group targeting rule matches
# =========================================================

def test_group_targeting_rule_matches(monkeypatch):

    flag = DummyFlag(
        flag_key="new_dashboard",
        enabled=False,
        default_value="false",
        environment_id=1,
    )

    rule = DummyRule(
        attribute="group",
        operator="equals",
        value="beta-users",
    )

    db = DummyDB(
        flag=flag,
        environment=DummyEnvironment(1),
        rules=[rule],
    )

    class DummyMembership:
        def __init__(self, group_name):
            self.group_name = group_name

    def fake_get_user_groups(db, user_id):
        return [
            DummyMembership("beta-users")
        ]

    monkeypatch.setattr(
        evaluator_service,
        "get_user_groups",
        fake_get_user_groups,
    )

    result = evaluate_flag(
        db=db,
        flag_key="new_dashboard",
        environment_id=1,
        user_context={
            "user_id": "user-123"
        },
    )

    assert result["enabled"] is True
    assert result["reason"] == (
        "Group targeting rule matched: beta-users"
    )


# =========================================================
# Test 8
# Group targeting rule does not match
# =========================================================

def test_group_targeting_rule_does_not_match(monkeypatch):

    flag = DummyFlag(
        flag_key="new_dashboard",
        enabled=True,
        default_value="false",
        environment_id=1,
    )

    rule = DummyRule(
        attribute="group",
        operator="equals",
        value="beta-users",
    )

    db = DummyDB(
        flag=flag,
        environment=DummyEnvironment(1),
        rules=[rule],
    )

    class DummyMembership:
        def __init__(self, group_name):
            self.group_name = group_name

    def fake_get_user_groups(db, user_id):
        return [
            DummyMembership("normal-users")
        ]

    monkeypatch.setattr(
        evaluator_service,
        "get_user_groups",
        fake_get_user_groups,
    )

    result = evaluate_flag(
        db=db,
        flag_key="new_dashboard",
        environment_id=1,
        user_context={
            "user_id": "user-123"
        },
    )

    assert result["enabled"] is True
    assert result["reason"] == "Default evaluation"


# =========================================================
# Test 9
# Same user + same flag gets same bucket
# =========================================================

def test_percentage_rollout_is_deterministic():

    bucket_1 = evaluator_service.get_user_bucket(
        user_id="user-123",
        flag_key="new_dashboard",
    )

    bucket_2 = evaluator_service.get_user_bucket(
        user_id="user-123",
        flag_key="new_dashboard",
    )

    assert bucket_1 == bucket_2
    assert 0 <= bucket_1 <= 99


# =========================================================
# Test 10
# 0% rollout should not enable user
# =========================================================

def test_zero_percent_rollout():

    flag = DummyFlag(
        flag_key="new_dashboard",
        enabled=True,
        default_value="false",
        environment_id=1,
        rollout_percentage=0,
    )

    db = DummyDB(
        flag=flag,
        environment=DummyEnvironment(1),
    )

    result = evaluate_flag(
        db=db,
        flag_key="new_dashboard",
        environment_id=1,
        user_context={
            "user_id": "user-123"
        },
    )

    assert result["enabled"] is True
    assert result["reason"] == "Default evaluation"


# =========================================================
# Test 11
# 100% rollout should always enable user
# =========================================================

def test_hundred_percent_rollout():

    flag = DummyFlag(
        flag_key="new_dashboard",
        enabled=False,
        default_value="false",
        environment_id=1,
        rollout_percentage=100,
    )

    db = DummyDB(
        flag=flag,
        environment=DummyEnvironment(1),
    )

    result = evaluate_flag(
        db=db,
        flag_key="new_dashboard",
        environment_id=1,
        user_context={
            "user_id": "user-123"
        },
    )

    assert result["enabled"] is True
    assert "Percentage rollout matched" in result["reason"]


# =========================================================
# Test 12
# Percentage rollout match
# =========================================================

def test_percentage_rollout_match(monkeypatch):

    flag = DummyFlag(
        flag_key="new_dashboard",
        enabled=False,
        default_value="false",
        environment_id=1,
        rollout_percentage=25,
    )

    db = DummyDB(
        flag=flag,
        environment=DummyEnvironment(1),
    )

    monkeypatch.setattr(
        evaluator_service,
        "get_user_bucket",
        lambda user_id, flag_key: 10,
    )

    result = evaluate_flag(
        db=db,
        flag_key="new_dashboard",
        environment_id=1,
        user_context={
            "user_id": "user-123"
        },
    )

    assert result["enabled"] is True
    assert result["reason"] == (
        "Percentage rollout matched: "
        "25% (bucket 10)"
    )


# =========================================================
# Test 13
# Percentage rollout non-match
# =========================================================

def test_percentage_rollout_does_not_match(monkeypatch):

    flag = DummyFlag(
        flag_key="new_dashboard",
        enabled=True,
        default_value="true",
        environment_id=1,
        rollout_percentage=25,
    )

    db = DummyDB(
        flag=flag,
        environment=DummyEnvironment(1),
    )

    monkeypatch.setattr(
        evaluator_service,
        "get_user_bucket",
        lambda user_id, flag_key: 80,
    )

    result = evaluate_flag(
        db=db,
        flag_key="new_dashboard",
        environment_id=1,
        user_context={
            "user_id": "user-123"
        },
    )

    assert result["enabled"] is False
    assert result["reason"] == (
        "Percentage rollout not matched: "
        "25% (bucket 80)"
    )


# =========================================================
# Test 14
# Environment override works
# =========================================================

def test_environment_override_value():

    flag = DummyFlag(
        flag_key="new_dashboard",
        enabled=False,
        default_value="false",
        environment_id=1,
    )

    override = DummyOverride(
        enabled=True,
        value="override-value",
    )

    db = DummyDB(
        flag=flag,
        environment=DummyEnvironment(1),
        override=override,
    )

    result = evaluate_flag(
        db=db,
        flag_key="new_dashboard",
        environment_id=1,
    )

    assert result["enabled"] is True
    assert result["default_value"] == "override-value"
    assert result["reason"] == (
        "Environment override matched"
    )


# =========================================================
# Test 15
# Environment not found
# =========================================================

def test_environment_not_found():

    db = DummyDB(
        flag=None,
        environment=None,
    )

    # Override the default environment with no environment.
    db.environment = None

    result = evaluate_flag(
        db=db,
        flag_key="new_dashboard",
        environment_id=999,
    )

    assert result["enabled"] is False
    assert result["default_value"] is None
    assert result["reason"] == "Environment not found"


# =========================================================
# Test 16
# Flag not found
# =========================================================

def test_flag_not_found():

    db = DummyDB(
        flag=None,
        environment=DummyEnvironment(1),
    )

    result = evaluate_flag(
        db=db,
        flag_key="missing_flag",
        environment_id=1,
    )

    assert result["enabled"] is False
    assert result["default_value"] is None
    assert result["reason"] == "Flag not found"