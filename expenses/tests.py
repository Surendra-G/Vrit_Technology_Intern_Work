from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import ExpenseIncome

class AuthenticationTests(APITestCase):
    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpassword123'
        }
        self.user = User.objects.create_user(**self.user_data)
        
    def test_user_registration(self):
        url = reverse('register')
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'newpassword123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
    def test_user_login(self):
        url = reverse('login')
        data = {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

class ExpenseIncomeTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='pass123')
        self.user2 = User.objects.create_user(username='user2', password='pass123')
        self.admin = User.objects.create_superuser(username='admin', password='admin123')
        
        self.expense1 = ExpenseIncome.objects.create(
            user=self.user1,
            title='Test Expense 1',
            amount=100.00,
            transaction_type='debit',
            tax=10.00,
            tax_type='flat'
        )
        
        self.expense2 = ExpenseIncome.objects.create(
            user=self.user2,
            title='Test Expense 2',
            amount=200.00,
            transaction_type='debit',
            tax=10.00,
            tax_type='percentage'
        )
        
    def test_create_expense(self):
        url = reverse('expenseincome-list')
        data = {
            'title': 'New Expense',
            'amount': 50.00,
            'transaction_type': 'debit',
            'tax': 5.00,
            'tax_type': 'flat'
        }
        
        # Unauthenticated request
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Authenticated request
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['total'], '55.00')
        
    def test_list_expenses(self):
        url = reverse('expenseincome-list')
        
        # User1 should only see their own expenses
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['id'], self.expense1.id)
        
        # Admin should see all expenses
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
        
    def test_tax_calculations(self):
        url = reverse('expenseincome-list')
        self.client.force_authenticate(user=self.user1)
        
        # Flat tax
        data = {
            'title': 'Flat Tax Test',
            'amount': 100.00,
            'transaction_type': 'debit',
            'tax': 10.00,
            'tax_type': 'flat'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.data['total'], '110.00')
        
        # Percentage tax
        data = {
            'title': 'Percentage Tax Test',
            'amount': 100.00,
            'transaction_type': 'debit',
            'tax': 10.00,
            'tax_type': 'percentage'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.data['total'], '110.00')
        
        # Zero tax
        data = {
            'title': 'Zero Tax Test',
            'amount': 100.00,
            'transaction_type': 'debit',
            'tax': 0.00,
            'tax_type': 'flat'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.data['total'], '100.00')