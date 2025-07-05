from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from expenses.views import UserViewSet, ExpenseIncomeViewSet, CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
from expenses.views import home
from django.conf.urls.static import static
from django.conf import settings

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'expenses', ExpenseIncomeViewSet, basename='expenseincome')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home, name='home'),
    path('api/auth/register/', UserViewSet.as_view({'post': 'register'}), name='register'),
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include(router.urls)),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)