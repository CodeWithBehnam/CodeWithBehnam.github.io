---
layout: post
title: "Day 165: Building Reliable Forecasts with Prophet (Docs Deep Dive)"
date: 2025-10-26
categories: [Time Series, Machine Learning, Forecasting]
tags: [prophet, python, time-series, forecasting, tutorial, sklearn]
---

**October 26, 2025 – Today's Vibe: Finally Taming the Time-Series Hydra**

I've dabbled in Prophet before, but today I sat down with every page in [`docs/_docs`](https://github.com/facebook/prophet/tree/main/docs/_docs)—from the [quick start](https://facebook.github.io/prophet/docs/quick_start.html#python-api) through diagnostics, shocks, and contributor notes—and rebuilt our KPI forecast from scratch. Turns out a single class that mimics the `sklearn` API (fit + predict) is exactly what my overcaffeinated brain needed. Here's how I turned a CSV of daily metrics into a full forecast—with uncertainty bounds, component plots, and hard-earned lessons from the entire documentation set.

## Install and Stay Compatible

The [installation guide](https://facebook.github.io/prophet/docs/installation.html) reminds us there are two fully supported runtimes:

- **Python:** `python -m pip install prophet` (the package was renamed from `fbprophet` at v1.0) and `conda install -c conda-forge prophet` if you prefer conda. Prophet 1.1+ wants Python 3.7 or newer.
- **R:** `install.packages('prophet')` from CRAN handles most cases. Windows users must install [Rtools](http://cran.r-project.org/bin/windows/Rtools/) first, and there’s an experimental [`cmdstanr` backend](https://mc-stan.org/cmdstanr/) for anyone avoiding the classic `rstan` toolchain.

If you hit platform-specific Stan problems, rerun installation inside a clean conda/venv (Python) or `renv` project (R). That mirrored setup pays dividends when you later share notebooks or debug reproducibility bugs.

## The Setup: Prophet Is Opinionated (In a Good Way)

Prophet expects a dataframe with just two columns:

- `ds`: datestamps (YYYY-MM-DD or full timestamps)
- `y`: numeric values to predict

That's it. Bring anything else and it politely ignores it. Here's the canonical bootstrapping block straight from the docs:

```python
import pandas as pd
from prophet import Prophet

df = pd.read_csv(
    "https://raw.githubusercontent.com/facebook/prophet/main/examples/example_wp_log_peyton_manning.csv"
)
df.head()
```

Under the hood Prophet handles multiple seasonality, changepoints, and holiday effects, but you only worry about feeding tidy data. The quick start uses Peyton Manning's Wikipedia pageviews because football seasonality is dramatic—ideal for testing weekly and yearly cycles.

## Fitting the Model: Constructor Controls Everything

Prophet follows the `sklearn` pattern:

```python
m = Prophet(
    yearly_seasonality="auto",
    weekly_seasonality=True,
    daily_seasonality=False,
    changepoint_prior_scale=0.05
)
m.fit(df)
```

Any hyperparameters (seasonality toggles, priors, holidays) belong in the constructor. `fit` ingests the historical dataframe and returns the model object so you can chain further calls if you like. For typical daily data, fitting takes a handful of seconds even on a laptop.

## Generating Future Dates Like a Pro

Predictions require a dataframe with a `ds` column that covers the desired horizon. Thankfully `make_future_dataframe` wraps all the calendaring logic:

```python
future = m.make_future_dataframe(periods=365)
future.tail()
```

By default it appends the future periods *after* the historical timeline, meaning the resulting dataframe includes both the original history and the new horizon. That's handy because the subsequent forecast includes in-sample fits, which you can compare against actuals without crafting two separate calls.

## Forecasting & Interpreting the Output

`m.predict(future)` returns a rich dataframe:

```python
forecast = m.predict(future)
forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail()
```

- `yhat` is the expected value.
- `yhat_lower` / `yhat_upper` form the uncertainty interval.
- Additional columns break down trend, seasonal components, and any holiday effects.

If you pass historical dates, `yhat` doubles as an in-sample fit. That means you can calculate residuals immediately:

```python
df_eval = df.merge(forecast[["ds", "yhat"]], on="ds", how="left")
df_eval["residual"] = df_eval["y"] - df_eval["yhat"]
```

Plotting is builtin:

```python
fig1 = m.plot(forecast)
fig2 = m.plot_components(forecast)
```

The first graph shows the forecast + uncertainty; the component plot decomposes trend, weekly seasonality, yearly seasonality, and holidays. If you're demoing to stakeholders who love interactive visuals, `from prophet.plot import plot_plotly` renders the exact same data with hover tooltips—just remember to install Plotly and Jupyter widgets separately.

## Practical Notes the Quick Start Implies (But Doesn't Shout)

1. **Preprocessing matters.** Prophet assumes `y` is already transformed the way you want (log, % change, etc.). The Peyton Manning example uses log pageviews. Inverse-transform before presenting results to humans.
2. **Missing dates? Fill them.** Prophet expects evenly spaced time steps. If your business KPI skips weekends, create rows with `y=NaN` and let Prophet handle them, or aggregate to weeks.
3. **Defaults aren't magic.** The base constructor handles a ton, but you should set `seasonality_mode='multiplicative'` when amplitude grows with the signal, and adjust `changepoint_prior_scale` if trend shifts lag reality.
4. **Holidays require data.** The quick start hints at this via component plots. Define custom holiday dataframes (with `ds` and `holiday` columns) before instantiating Prophet, then watch the component plot flag them.
5. **Performance scales with rows.** The example uses ~3k days of data. If you're pushing millions, sample or aggregate first—Prophet isn't a distributed library.

## Bringing It Back to Real KPIs

After recreating the doc example, I swapped in our subscription renewals:

1. **Cleaned metrics** down to `ds` (daily) and `y` (log of renewals).
2. **Added a holidays dataframe** for marketing campaigns and national events.
3. **Set `seasonality_mode='multiplicative'`** because seasonal swings grow with volume.
4. **Extended 120 days** via `make_future_dataframe(periods=120)` to capture the next fiscal quarter.

The resulting forecast highlighted a looming dip during a known summer lull. Because the component plot clearly isolated weekly + yearly patterns, the marketing team agreed to stage promos in the week leading into the trough. Total time spent: ~30 minutes, including copy-pasting snippets from the quick start.

## R API Parity from the Same Quick Start

The [R section](https://facebook.github.io/prophet/docs/quick_start.html#r-api) uses the same two-column contract. Replace `Prophet()`/`m.predict` with `prophet()`/`predict`, call `make_future_dataframe(m, periods = 365)`, and reach for `prophet_plot_components(m, forecast)` or even `dyplot.prophet` if you want interactive visuals without Plotly. If your org is bilingual, you can literally translate the Python snippets into R line for line.

## Seasonality, Holidays, and Regressors Deep Dive

After the quick start, the [seasonality, holiday effects, and regressors guide](https://facebook.github.io/prophet/docs/seasonality,_holiday_effects,_and_regressors.html) plus the focused [holiday page](https://facebook.github.io/prophet/docs/holiday_effects.html) become the difference between a “nice toy” and a production-ready forecast:

- **Manual holidays.** Build a dataframe with `holiday`, `ds`, and optional `lower_window`/`upper_window` columns to capture things like “Super Bowl + the Monday hangover”. Prophet adds both effects “stacked,” so a `superbowl` row can coexist with a more generic `playoff` row.
  
  ```python
  playoffs = pd.DataFrame({
      "holiday": "playoff",
      "ds": pd.to_datetime([...]),
      "lower_window": 0,
      "upper_window": 1,
  })
  superbowls = pd.DataFrame({
      "holiday": "superbowl",
      "ds": pd.to_datetime([...]),
      "lower_window": 0,
      "upper_window": 1,
  })
  holidays = pd.concat((playoffs, superbowls))
  m = Prophet(holidays=holidays, holidays_prior_scale=0.5).fit(df)
  ```

- **Built-in holiday calendars.** `m.add_country_holidays(country_name='US')` (or GB, DE, etc.) bolts on official dates, while `from prophet.make_holidays import make_holidays_df` lets you target a province/state via the `holidays` PyPI package.
- **Custom/conditional seasonalities.** `m.add_seasonality(name='monthly', period=30.5, fourier_order=5)` models months, while conditionals (`condition_name='pre_covid'`) let you create separate patterns for pre/post regimes or weekdays/weekends.
- **Fourier order + priors.** Yearly seasonality defaults to 10 Fourier terms; bump it (`yearly_seasonality=20`) for sharper wiggles and counteract overfitting with `seasonality_prior_scale`.
- **Extra regressors.** `m.add_regressor('promo_flag', prior_scale=5, mode='multiplicative', standardize=False)` folds in binary or continuous drivers. Afterwards, `from prophet.utilities import regressor_coefficients` surfaces the learned beta, so stakeholders can quantify promo lift.

## Multiplicative vs. Additive Patterns

The [multiplicative seasonality doc](https://facebook.github.io/prophet/docs/multiplicative_seasonality.html) shows that seasonal swings often scale with the level of the series (air passenger counts are the canonical example). Switching to `Prophet(seasonality_mode='multiplicative')` keeps seasonal amplitude proportional to the trend. You can override specific components (`m.add_seasonality(..., mode='additive')`) or regressors to mix and match.

## Growth, Saturation, and Trend Control

Between the [saturating forecasts](https://facebook.github.io/prophet/docs/saturating_forecasts.html), [trend changepoints](https://facebook.github.io/prophet/docs/trend_changepoints.html), and [additional topics](https://facebook.github.io/prophet/docs/additional_topics.html) docs you get complete control over slope behavior:

- **Logistic caps/floors.** Add `df['cap'] = 8.5` (and optional `floor`) plus `Prophet(growth='logistic')` when the KPI approaches a natural limit. The `cap` can vary over time if your market size is expanding.
- **Flat or custom trends.** `Prophet(growth='flat')` freezes slope so the model leans entirely on seasonalities/regressors—a lifesaver for causal counterfactuals. For exotic behavior, the docs point to PRs implementing step-function trends; cloning the repo and editing the trend helper is the sanctioned route.
- **Changepoint knobs.** `changepoint_prior_scale` adjusts how aggressively Prophet bends the trend; `changepoint_range` (default 0.8) keeps changepoints away from the extreme tail; `changepoints=[...]` pins them on known release dates, and `add_changepoints_to_plot` overlays them on the chart for QA.
- **Warm starts and scaling.** Because models must be refit when data updates, the docs show how to pass `init=warm_start_params(old_model)` and how to set `scaling='minmax'` when gigantic targets otherwise compress into `[0.999,1]`.

## Handling Shocks and Regime Changes

The [handling shocks playbook](https://facebook.github.io/prophet/docs/handling_shocks.html) walks through COVID-era pedestrian counts and demonstrates:

- Treat lockdown periods as once-off holidays with precise windows so Prophet doesn’t smear the effect everywhere.
- Sense-check the fitted trend (sometimes a flatter `growth='flat'` or a larger `changepoint_prior_scale` tells the model to follow post-shock drift).
- Use **conditional seasonalities** to split “weekly pattern before COVID” and “weekly pattern after COVID,” each with its own `condition_name`.
- If in doubt, re-train often and surface wider uncertainty intervals to signal stakeholders that behavior is volatile.

## Non-Daily Data, Gaps, and Outliers

The [non-daily data](https://facebook.github.io/prophet/docs/non-daily_data.html) and [outliers](https://facebook.github.io/prophet/docs/outliers.html) docs read like a defensive driving course:

- For sub-daily data, pass a timestamped `ds` and set `freq` in `make_future_dataframe` (`freq='H'` for hourly, `'MS'` for month-start). Prophet auto-adds daily seasonality if needed.
- Only forecast time windows you’ve actually seen; if you train on 12 a.m.–6 a.m. temps, filter the future dataframe to those hours before calling `predict`.
- Monthly aggregates need monthly forecasts—requesting daily outputs creates overfit fillings between sparse observations. Use `freq='MS'` or build one-hot month regressors instead of enabling weekly seasonality.
- Weekly/monthly holidays must be shifted onto the actual timestamps used in your aggregated history, otherwise the effect is ignored.
- Outliers? Replace the offending rows with `None`/`NA` in `y` and keep the timestamp so Prophet still predicts that point. This tightens uncertainty bands and stops weird spikes from contaminating seasonality forever.

```python
mask = (df['ds'] > '2015-06-01') & (df['ds'] < '2015-06-30')
df.loc[mask, 'y'] = None
m = Prophet().fit(df)
```

## Diagnostics, Cross-Validation, and Hyperparameter Tuning

The [diagnostics page](https://facebook.github.io/prophet/docs/diagnostics.html) gives Prophet a statistically sound maintenance story:

```python
from prophet.diagnostics import cross_validation, performance_metrics

df_cv = cross_validation(
    m,
    initial='730 days',
    period='180 days',
    horizon='365 days',
    parallel='processes',  # also accepts "threads" or "dask"
)
df_p = performance_metrics(df_cv, rolling_window=0.1)
```

- `cross_validation` simulates historical forecasts by rolling a cutoff window through the training set; `performance_metrics` turns those residuals into RMSE/MAE/MAPE coverage stats, and `plot_cross_validation_metric` visualizes errors vs. horizon.
- Parallelization happens at the cutoff level, so you can add CPU cores (`parallel="processes"`) or ship the job to a Dask cluster for monster series.
- Hyperparameter tuning is just a grid or random search that wraps `Prophet(**params)` inside the CV call. The docs even lay out the sensible ranges: `changepoint_prior_scale ∈ [0.001, 0.5]`, `seasonality_prior_scale/holidays_prior_scale ∈ [0.01, 10]`, and `seasonality_mode ∈ {'additive','multiplicative'}` depending on your data.

## Quantifying Uncertainty (and When to Sample)

Per the [uncertainty guide](https://facebook.github.io/prophet/docs/uncertainty_intervals.html):

- `interval_width=0.95` widens your prediction band, but remember it still assumes “future changepoints resemble the past.”
- If you want uncertainty on seasonal components—not just the trend—set `m = Prophet(mcmc_samples=300)` to draw full posterior samples (expect longer runtimes). Access the raw draws with `m.predictive_samples(future)`.
- `changepoint_prior_scale` influences band width too; looser priors mean more trend volatility, which automatically inflates predictive intervals.

## Operational Extras: Saving, Inspecting, and External References

Highlights from the rest of [additional topics](https://facebook.github.io/prophet/docs/additional_topics.html):

- **Serialization:** Skip pickle. Use `from prophet.serialize import model_to_json, model_from_json` to write/read portable artifacts between machines and Prophet releases.
- **Inspecting transformations:** `transformed = m.preprocess(df)` shows the scaled `y` and design matrix feeding Stan. `m.calculate_initial_params(...)` dumps the initialization used for optimization so you can debug weird fits.
- **Warm starts:** The provided `warm_start_params` utility recycles `k`, `m`, `delta`, `beta`, and `sigma_obs` into the next fit—handy when you ingest new data daily.
- **Scaling toggle:** `Prophet(scaling='minmax')` avoids the “target values all sit near 1.0” issue when modelling very large KPIs.
- **Flat/custom trends and references:** The docs openly recommend alternatives like Nixtla’s `statsforecast`/`neuralforecast` and PyTorch-based `NeuralProphet` if you need bleeding-edge accuracy.

## Growth-Friendly Holidays and Conditional Weekly Patterns

Need more than the default `holidays` argument? The [holiday effects doc](https://facebook.github.io/prophet/docs/holiday_effects.html) reiterates how adding `lower_window`/`upper_window` extends an effect forward/backward (e.g., capture both Thanksgiving and Black Friday) and how `holidays_prior_scale` tempers overfit spikes for sparse events like the Super Bowl. Combine that with conditional seasonality + `condition_name`, and you can do “weekly pattern only during the on-season” or “post-lockdown Friday ≠ pre-lockdown Friday” in a single model.

## Logistics for Getting Help and Contributing

Finally, the [contributing guide](https://facebook.github.io/prophet/docs/contributing.html) doubles as a status update: the core team is in maintenance mode (see their 2023 roadmap blog), but they still welcome reproducible bug reports via GitHub issues. If you want to send a PR:

- Fork the repo, use `pip install -e ".[dev,parallel]"` for Python or `R CMD INSTALL .` inside the `R/` folder, and manage dependencies with conda/venv or `renv`.
- Run tests (`pytest` in `python/`, `devtools::test()` or `testthat::test_dir` in `R/`), regenerate docs via `cd docs && make notebooks`, and keep R/Python features in sync.
- Follow their checklist: docstrings, unit tests, regenerated `roxygen` docs, informative PR titles, and references to any related issues.

## TL;DR

- Create a two-column dataframe (`ds`, `y`) and instantiate `Prophet`, then layer on the documented extras: custom holidays, conditional seasonalities, extra regressors, and the right growth mode for your KPI.
- Fit with `m.fit(df)`, generate future dates with `make_future_dataframe`, and call `m.predict`—but validate with `prophet.diagnostics.cross_validation`, tune priors, and inspect changepoints before you ship.
- Treat non-daily data, shocks, outliers, and saturation exactly the way the docs describe: adjust `freq`, add one-off holidays, zero out anomalous `y`, and use logistic caps/floors or flat trends.
- Serialize models with `model_to_json`, warm-start incremental retrains, and widen intervals (`interval_width`, `mcmc_samples`) when behavior gets volatile.
- When you get stuck, the installation + contributing sections spell out how to raise an issue, run the tests, or port a fix back to both Python and R.

If you're wrestling with seasonal KPIs and dread writing ARIMA boilerplate, the full Prophet docset is the calmest path to a production-worthy forecast. Copy the snippets above, wire in your own data (plus holidays/regressors), and you'll have a defensible time-series story before your coffee cools.
