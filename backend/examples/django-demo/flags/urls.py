from django.urls import path

from .views import demo, middleware_demo


urlpatterns = [
    path(
        "demo/<str:flag_key>/",
        demo,
        name="flag-demo",
    ),
    path(
        "middleware-demo/<str:flag_key>/",
        middleware_demo,
        name="middleware-demo",
    ),
]