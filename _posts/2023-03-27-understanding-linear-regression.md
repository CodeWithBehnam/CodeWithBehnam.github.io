---
layout: post
title: "Understanding Linear Regression: The Foundation of Predictive Modeling"
date: 2023-03-27
categories: [Statistics, Machine Learning]
tags: [linear regression, statistics, machine learning, python, scikit-learn]
---

Linear regression is one of the most fundamental and widely used algorithms in statistics and machine learning. Despite its simplicity, it forms the foundation for many more complex models and continues to be invaluable in various fields. In this post, I'll explain what linear regression is, how it works, and how to implement it in Python.

## What is Linear Regression?

Linear regression is a statistical method that attempts to model the relationship between a dependent variable (target) and one or more independent variables (features) by fitting a linear equation to the observed data.

The simplest form is simple linear regression, with one independent variable:

$$y = \beta_0 + \beta_1 x + \epsilon$$

Where:
- $y$ is the dependent variable
- $x$ is the independent variable
- $\beta_0$ is the y-intercept (the value of $y$ when $x = 0$)
- $\beta_1$ is the slope (the change in $y$ for a unit change in $x$)
- $\epsilon$ is the error term (the difference between predicted and actual values)

With multiple independent variables, we have multiple linear regression:

$$y = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + ... + \beta_n x_n + \epsilon$$

## The Mathematics Behind Linear Regression

Linear regression works by finding the "line of best fit" through the data points. But what makes a line the "best fit"? The most common criterion is to minimize the sum of squared errors (SSE) between the predicted values and the actual values.

For each data point, we calculate the error (residual) as:

$$e_i = y_i - \hat{y}_i$$

Where $y_i$ is the actual value and $\hat{y}_i$ is the predicted value.

Then, we aim to minimize:

$$SSE = \sum_{i=1}^{n} e_i^2 = \sum_{i=1}^{n} (y_i - \hat{y}_i)^2$$

This approach is called the method of Ordinary Least Squares (OLS). Mathematically, we can derive the optimal values for $\beta_0$ and $\beta_1$ in simple linear regression as:

$$\beta_1 = \frac{\sum_{i=1}^{n} (x_i - \bar{x})(y_i - \bar{y})}{\sum_{i=1}^{n} (x_i - \bar{x})^2}$$

$$\beta_0 = \bar{y} - \beta_1 \bar{x}$$

Where $\bar{x}$ and $\bar{y}$ are the means of the $x$ and $y$ variables.

## Implementing Linear Regression in Python

Let's see how to implement linear regression in Python using both NumPy for the mathematical approach and scikit-learn for a more practical approach.

### Creating Sample Data

First, let's create some sample data to work with:

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

# Generate synthetic data with some noise
np.random.seed(42)
X = 2 * np.random.rand(100, 1)  # 100 samples, 1 feature
y = 4 + 3 * X + np.random.randn(100, 1)  # y = 4 + 3X + noise

# Plot the data
plt.scatter(X, y)
plt.xlabel('X')
plt.ylabel('y')
plt.title('Generated Data')
plt.show()
```

### Implementing Linear Regression from Scratch with NumPy

Let's implement simple linear regression using the mathematical formulas:

```python
# Calculate the means
x_mean = np.mean(X)
y_mean = np.mean(y)

# Calculate the slope (β₁)
numerator = np.sum((X - x_mean) * (y - y_mean))
denominator = np.sum((X - x_mean) ** 2)
beta_1 = numerator / denominator

# Calculate the intercept (β₀)
beta_0 = y_mean - beta_1 * x_mean

# Make predictions
y_pred = beta_0 + beta_1 * X

print(f"Manual Linear Regression: y = {beta_0[0]:.4f} + {beta_1[0]:.4f} * X")

# Plot the regression line
plt.scatter(X, y)
plt.plot(X, y_pred, color='red')
plt.xlabel('X')
plt.ylabel('y')
plt.title('Linear Regression from Scratch')
plt.show()
```

### Using scikit-learn for Linear Regression

Now, let's use scikit-learn which is more convenient for real-world applications:

```python
# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Create and train the model
model = LinearRegression()
model.fit(X_train, y_train)

# Make predictions
y_pred = model.predict(X_test)

# Print the coefficients
print(f"Scikit-learn: y = {model.intercept_[0]:.4f} + {model.coef_[0][0]:.4f} * X")

# Evaluate the model
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f"Mean Squared Error: {mse:.4f}")
print(f"R² Score: {r2:.4f}")

# Plot the results
plt.scatter(X_test, y_test, color='blue', label='Actual')
plt.scatter(X_test, y_pred, color='red', label='Predicted')
plt.xlabel('X')
plt.ylabel('y')
plt.title('Linear Regression with Scikit-learn')
plt.legend()
plt.show()
```

## Multiple Linear Regression

Let's extend our example to multiple linear regression with two features:

```python
# Generate synthetic data with two features
np.random.seed(42)
X_multi = np.random.rand(100, 2)  # 100 samples, 2 features
y_multi = 4 + 3 * X_multi[:, 0] + 2 * X_multi[:, 1] + np.random.randn(100)

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X_multi, y_multi, test_size=0.2, random_state=42)

# Create and train the model
model_multi = LinearRegression()
model_multi.fit(X_train, y_train)

# Make predictions
y_pred_multi = model_multi.predict(X_test)

# Print the coefficients
print(f"Multiple Linear Regression:")
print(f"Intercept: {model_multi.intercept_:.4f}")
print(f"Coefficients: {model_multi.coef_}")

# Evaluate the model
mse_multi = mean_squared_error(y_test, y_pred_multi)
r2_multi = r2_score(y_test, y_pred_multi)
print(f"Mean Squared Error: {mse_multi:.4f}")
print(f"R² Score: {r2_multi:.4f}")
```

## Evaluating Linear Regression Models

When evaluating a linear regression model, several key metrics are commonly used:

1. **Mean Squared Error (MSE)**: The average of the squared differences between predicted and actual values. Lower is better.

2. **Root Mean Squared Error (RMSE)**: The square root of MSE, which gives an error metric in the same units as the target variable.

3. **Mean Absolute Error (MAE)**: The average of the absolute differences between predicted and actual values. Less sensitive to outliers than MSE.

4. **R² Score (Coefficient of Determination)**: Measures the proportion of variance in the dependent variable that can be explained by the independent variables. Ranges from 0 to 1, with higher values indicating better fit.

5. **Adjusted R²**: A modified version of R² that adjusts for the number of predictors in the model.

Let's calculate all these metrics for our model:

```python
from sklearn.metrics import mean_absolute_error

# Calculate various metrics
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

# Calculate adjusted R²
n = len(y_test)  # number of samples
p = X_test.shape[1]  # number of predictors
adjusted_r2 = 1 - (1 - r2) * (n - 1) / (n - p - 1)

print(f"Evaluation Metrics:")
print(f"Mean Squared Error (MSE): {mse:.4f}")
print(f"Root Mean Squared Error (RMSE): {rmse:.4f}")
print(f"Mean Absolute Error (MAE): {mae:.4f}")
print(f"R² Score: {r2:.4f}")
print(f"Adjusted R² Score: {adjusted_r2:.4f}")
```

## Assumptions of Linear Regression

Linear regression makes several key assumptions:

1. **Linearity**: The relationship between the independent and dependent variables is linear.
2. **Independence**: The errors are independent of each other.
3. **Homoscedasticity**: The errors have constant variance.
4. **Normality**: The errors are normally distributed.
5. **No multicollinearity**: The independent variables are not highly correlated with each other.

Violating these assumptions can lead to biased or inefficient estimates.

## Limitations and Extensions of Linear Regression

Linear regression has several limitations:

1. It assumes a linear relationship between variables.
2. It is sensitive to outliers.
3. It assumes independence among predictors.

For more complex relationships, extensions and alternatives include:

- **Polynomial Regression**: Adds polynomial terms to model non-linear relationships.
- **Ridge Regression**: Adds L2 regularization to handle multicollinearity.
- **Lasso Regression**: Adds L1 regularization for feature selection.
- **Elastic Net**: Combines L1 and L2 regularization.
- **Support Vector Regression**: Uses kernel functions for non-linear relationships.
- **Decision Trees and Random Forests**: Can capture complex non-linear relationships.

## Conclusion

Linear regression is a powerful, interpretable, and computationally efficient method for understanding relationships between variables and making predictions. Despite its simplicity, it forms the foundation for many more complex statistical and machine learning models.

In this post, we've covered the basics of linear regression, its mathematical foundations, implementation in Python, evaluation metrics, assumptions, and extensions. In future posts, we'll explore more advanced regression techniques that build upon these fundamentals.

Remember, the simplest solution that adequately addresses the problem is often the best, and linear regression frequently fits that description. 