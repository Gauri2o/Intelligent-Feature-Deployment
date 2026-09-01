import json

from app.crud.audit_log import (
    create_log,
    get_audit_logs,
    get_audit_log,
)


class FakeQuery:

    def __init__(self, results):
        self.results = results

    def order_by(self, *args, **kwargs):
        return self

    def filter(self, *args, **kwargs):
        return self

    def all(self):
        return self.results

    def first(self):
        return self.results[0] if self.results else None


class FakeDB:

    def __init__(self):
        self.logs = []
        self.next_id = 1

    def add(self, log):
        log.id = self.next_id
        self.next_id += 1
        self.logs.append(log)

    def commit(self):
        pass

    def refresh(self, log):
        pass

    def query(self, model):
        return FakeQuery(self.logs)


def test_create_audit_log_accuracy():

    db = FakeDB()

    before = {
        "enabled": False,
        "default_value": "false",
    }

    after = {
        "enabled": True,
        "default_value": "true",
    }

    log = create_log(
        db=db,
        action="ENABLE_FLAG",
        flag_key="dark_mode",
        user="admin",
        environment_id=1,
        before_value=before,
        after_value=after,
    )

    assert log.id == 1
    assert log.action == "ENABLE_FLAG"
    assert log.flag_key == "dark_mode"
    assert log.user == "admin"
    assert log.environment_id == 1

    assert json.loads(
        log.before_value
    ) == before

    assert json.loads(
        log.after_value
    ) == after


def test_create_audit_log_without_before_after():

    db = FakeDB()

    log = create_log(
        db=db,
        action="EVALUATE_FLAG",
        flag_key="dark_mode",
        user="admin",
        environment_id=1,
    )

    assert log.action == "EVALUATE_FLAG"
    assert log.before_value is None
    assert log.after_value is None


def test_get_audit_log():

    db = FakeDB()

    log = create_log(
        db=db,
        action="CREATE_FLAG",
        flag_key="new_dashboard",
        user="admin",
        environment_id=1,
        before_value=None,
        after_value={
            "enabled": True
        },
    )

    result = get_audit_log(
        db=db,
        log_id=log.id,
    )

    assert result is log
    assert result.action == "CREATE_FLAG"
    assert result.flag_key == "new_dashboard"


def test_get_audit_logs():

    db = FakeDB()

    create_log(
        db=db,
        action="CREATE_FLAG",
        flag_key="dark_mode",
        user="admin",
        environment_id=1,
    )

    create_log(
        db=db,
        action="UPDATE_FLAG",
        flag_key="new_dashboard",
        user="developer",
        environment_id=2,
    )

    logs = get_audit_logs(
        db=db
    )

    assert len(logs) == 2

    assert logs[0].action == "CREATE_FLAG"
    assert logs[1].action == "UPDATE_FLAG"