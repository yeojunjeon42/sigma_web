---
title: From least squares to gradient descent
date: 2026-08-20
year: 2026
summary: A seminar write-up that builds the first models of machine learning from their mathematics — least squares, likelihood, the logistic loss and the step that minimises it.
tags: [세미나, 머신러닝]
author: Author
sample: true
---

Most of what a first machine-learning course calls "training" is one idea used over and over: write down how wrong a model is as a function of its parameters, then move the parameters downhill. This note builds that idea from the ground up, starting with the oldest model there is — a straight line fitted by least squares — and ending with the update rule that trains networks with billions of weights.

## 1. The setting

We are given $n$ examples. Each example $i$ has a feature vector $x_i \in \mathbb{R}^d$ and a target $y_i$. Stack the features as rows of a design matrix and the targets as a column:

$$
X = \begin{bmatrix} x_1^\top \\ \vdots \\ x_n^\top \end{bmatrix} \in \mathbb{R}^{n \times d},
\qquad
y = \begin{bmatrix} y_1 \\ \vdots \\ y_n \end{bmatrix} \in \mathbb{R}^{n}.
$$

A model is a function $f_\theta$ with parameters $\theta$, and a loss $\ell(f_\theta(x), y)$ measures one mistake. Training means choosing

$$
\hat\theta = \arg\min_\theta \; L(\theta), \qquad L(\theta) = \frac{1}{n} \sum_{i=1}^{n} \ell\big(f_\theta(x_i), y_i\big).
$$

Everything below is a particular choice of $f_\theta$ and $\ell$, and a way of finding the minimum.

## 2. Linear regression and the normal equations

The linear model predicts $f_\beta(x) = x^\top \beta$ with $\beta \in \mathbb{R}^d$. (A constant column of ones in $X$ gives it an intercept.) With the squared loss, the total error is

$$
L(\beta) = \lVert y - X\beta \rVert_2^2 = (y - X\beta)^\top (y - X\beta).
$$

This function is a quadratic bowl in $\beta$, so its minimum is where the gradient vanishes. The derivation takes four lines:

1. Expand the product: $L(\beta) = y^\top y - 2\beta^\top X^\top y + \beta^\top X^\top X \beta$.
2. Differentiate term by term, using $\nabla_\beta (\beta^\top a) = a$ and $\nabla_\beta (\beta^\top A \beta) = 2A\beta$ for symmetric $A$: $\nabla L(\beta) = -2X^\top y + 2X^\top X \beta$.
3. Set the gradient to zero. This gives the **normal equations**: $X^\top X \beta = X^\top y$.
4. If $X^\top X$ is invertible — which holds exactly when the columns of $X$ are linearly independent — the solution is unique:

$$
\hat\beta = (X^\top X)^{-1} X^\top y .
$$

The name "normal" is geometric. Rewrite the equations as $X^\top (y - X\hat\beta) = 0$: the residual $y - X\hat\beta$ is orthogonal, or *normal*, to every column of $X$. The fitted values $X\hat\beta$ are the orthogonal projection of $y$ onto the column space of $X$, and $H = X(X^\top X)^{-1}X^\top$ is the matrix that performs that projection.

> In practice nobody forms $(X^\top X)^{-1}$. Solving the system with a QR or Cholesky factorisation is faster and far more stable, because inverting squares the condition number of the problem.

## 3. Why squares? Maximum likelihood

The squared loss can look arbitrary. It is not: it falls out of a probabilistic assumption about the noise. Suppose each target is the model's prediction plus independent Gaussian noise,

$$
y_i = x_i^\top \beta + \varepsilon_i, \qquad \varepsilon_i \sim \mathcal{N}(0, \sigma^2).
$$

Then each $y_i$ has density $p(y_i \mid x_i, \beta) = \frac{1}{\sqrt{2\pi\sigma^2}} \exp\!\left(-\frac{(y_i - x_i^\top\beta)^2}{2\sigma^2}\right)$, and the likelihood of the whole data set is the product over $i$. Taking the logarithm turns the product into a sum:

$$
\log p(y \mid X, \beta) = -\frac{n}{2}\log(2\pi\sigma^2) - \frac{1}{2\sigma^2} \sum_{i=1}^{n} (y_i - x_i^\top \beta)^2 .
$$

The first term does not depend on $\beta$, and $\frac{1}{2\sigma^2}$ is a positive constant, so **maximising the likelihood is the same as minimising the sum of squared errors**. Least squares is the maximum-likelihood estimate under Gaussian noise. Change the noise model and the loss changes with it: Laplace noise gives the absolute error $\sum_i |y_i - x_i^\top\beta|$, which is less sensitive to outliers.

## 4. Classification: logistic regression

For a binary target $y_i \in \{0, 1\}$ a straight line is the wrong output — we want a probability. Logistic regression passes the linear score through the **sigmoid**

$$
\sigma(z) = \frac{1}{1 + e^{-z}}, \qquad p(y = 1 \mid x) = \sigma(x^\top w).
$$

The sigmoid maps $\mathbb{R}$ to $(0, 1)$, and it has a derivative that is pleasant to work with:

$$
\sigma'(z) = \sigma(z)\,\big(1 - \sigma(z)\big).
$$

Treat each label as a Bernoulli draw with probability $p_i = \sigma(x_i^\top w)$. The likelihood is $\prod_i p_i^{y_i}(1-p_i)^{1-y_i}$, and its negative logarithm, averaged over the data, is the **cross-entropy loss**

$$
L(w) = -\frac{1}{n} \sum_{i=1}^{n} \Big[ y_i \log p_i + (1 - y_i) \log (1 - p_i) \Big].
$$

Differentiating with the chain rule and the identity for $\sigma'$, almost everything cancels:

$$
\nabla L(w) = \frac{1}{n} \sum_{i=1}^{n} (p_i - y_i)\, x_i = \frac{1}{n} X^\top (p - y).
$$

This is the same shape as the least-squares gradient, $X^\top(X\beta - y)$, up to a constant: prediction minus target, weighted by the input. Unlike least squares, though, setting it to zero has no closed-form solution, because $p$ depends on $w$ through the sigmoid. We need an iterative method.

## 5. Gradient descent

The gradient $\nabla L(\theta)$ points in the direction of steepest increase. Stepping a little way against it lowers the loss:

$$
\theta_{t+1} = \theta_t - \eta \, \nabla L(\theta_t),
$$

where $\eta > 0$ is the **learning rate**. Why does this work, and how large may $\eta$ be? Suppose the gradient is Lipschitz with constant $L_{\text{smooth}}$: it cannot change faster than $L_{\text{smooth}}$ times the distance moved. A first-order Taylor bound then gives, for one step,

$$
L(\theta_{t+1}) \le L(\theta_t) - \eta\left(1 - \frac{\eta L_{\text{smooth}}}{2}\right) \lVert \nabla L(\theta_t) \rVert^2 .
$$

As long as $0 < \eta < 2 / L_{\text{smooth}}$, the bracket is positive and **every step decreases the loss** unless the gradient is already zero. For convex losses such as least squares and logistic regression, that is enough to reach the global minimum; with $\eta = 1/L_{\text{smooth}}$ the error after $t$ steps shrinks like $O(1/t)$, and like a geometric sequence when the loss is strongly convex.

The table summarises what the learning rate does in practice.

| Learning rate | Behaviour | What you see in the loss curve |
|---|---|---|
| Far too small | Safe but slow | A long, almost flat decline |
| About $1/L_{\text{smooth}}$ | Steady descent | A smooth curve that levels off |
| Near $2/L_{\text{smooth}}$ | Overshoots, zig-zags | A decreasing but jagged curve |
| Above $2/L_{\text{smooth}}$ | Diverges | The loss grows without bound |

On large data sets the full gradient is expensive, so we estimate it from a random mini-batch $B$ of examples, $\nabla L(\theta) \approx \frac{1}{|B|}\sum_{i \in B} \nabla \ell_i(\theta)$. That is **stochastic gradient descent**. The estimate is noisy but unbiased, and with a learning rate that decays over time it still converges.

The whole of logistic regression by gradient descent fits in a few lines:

```python
import numpy as np

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-z))

def fit_logistic(X, y, lr=0.1, steps=2000, lam=0.0):
    n, d = X.shape
    w = np.zeros(d)
    for _ in range(steps):
        p = sigmoid(X @ w)
        grad = X.T @ (p - y) / n + lam * w   # cross-entropy gradient + L2 term
        w -= lr * grad
    return w
```

## 6. Regularisation: a prior in disguise

When features are many or strongly correlated, $X^\top X$ is close to singular and the least-squares solution becomes huge and unstable. **Ridge regression** adds a penalty on the size of the weights:

$$
L_\lambda(\beta) = \lVert y - X\beta \rVert_2^2 + \lambda \lVert \beta \rVert_2^2, \qquad \hat\beta_\lambda = (X^\top X + \lambda I)^{-1} X^\top y .
$$

For any $\lambda > 0$ the matrix $X^\top X + \lambda I$ is positive definite, so the solution always exists and is stable.

The penalty has the same Bayesian reading as the squared loss. Put a Gaussian **prior** on the weights, $\beta \sim \mathcal{N}(0, \tau^2 I)$, and ask for the most probable weights after seeing the data — the maximum a posteriori (MAP) estimate. By Bayes' rule, the log-posterior is the log-likelihood plus the log-prior:

$$
\log p(\beta \mid X, y) = -\frac{1}{2\sigma^2} \lVert y - X\beta \rVert_2^2 - \frac{1}{2\tau^2} \lVert \beta \rVert_2^2 + \text{const}.
$$

Maximising this is exactly ridge regression with $\lambda = \sigma^2 / \tau^2$. A strong belief that the weights are small — a small $\tau$ — means a large penalty. A Laplace prior gives the $L_1$ penalty $\lambda\lVert\beta\rVert_1$ instead — the lasso — which drives some weights to exactly zero.

## 7. Bias and variance

Why accept a penalty that makes the fit to the training data worse? Because the training error is not what we care about. Suppose the true relationship is $y = f(x) + \varepsilon$ with noise variance $\sigma^2$, and let $\hat f$ be a model trained on a random data set. At a fixed point $x$, the expected squared error over data sets decomposes as

$$
\mathbb{E}\big[(y - \hat f(x))^2\big] = \underbrace{\big(\mathbb{E}[\hat f(x)] - f(x)\big)^2}_{\text{bias}^2} + \underbrace{\mathbb{E}\big[(\hat f(x) - \mathbb{E}[\hat f(x)])^2\big]}_{\text{variance}} + \underbrace{\sigma^2}_{\text{noise}} .
$$

A flexible model with no penalty has low bias but high variance: it chases the noise in each particular sample. Increasing $\lambda$ adds a little bias and removes a lot of variance, and somewhere in between the total error is smallest. Finding that point is what a validation set is for.

## 8. What carries over

Every model in this note followed the same recipe:

- choose a model $f_\theta$ and a noise assumption;
- turn the assumption into a loss through the negative log-likelihood;
- add a prior as a penalty if the data alone cannot pin the parameters down;
- minimise with gradient descent, taking steps no larger than the curvature allows.

A neural network changes only the first line — $f_\theta$ becomes a composition of many layers — and backpropagation is nothing more than the chain rule we used for the sigmoid, applied layer by layer. The mathematics of the straight line is the mathematics of the whole field.
