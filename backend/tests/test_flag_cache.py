from unittest.mock import patch


def test_update_flag_clears_evaluation_cache():
    """
    When a flag is updated,
    its evaluation cache must be invalidated.
    """

    # This test should be implemented with the
    # existing FastAPI TestClient and database
    # setup used by the project.
    #
    # The important assertion is:
    #
    # delete_flag_evaluation_cache.assert_called_once_with(
    #     flag_key="dark_mode"
    # )