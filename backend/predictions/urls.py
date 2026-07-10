from django.urls import path
from .views import PredictView, PredictBatchView, PredictionHistoryView

urlpatterns = [
    path('predict/', PredictView.as_view(), name='predict-single'),
    path('predict-batch/', PredictBatchView.as_view(), name='predict-batch'),
    path('predictions/', PredictionHistoryView.as_view(), name='predictions-history'),
]
