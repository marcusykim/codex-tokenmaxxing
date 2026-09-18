# Measured activity and speculative rank

This page is a personal scenario calculator. It does not estimate a statistically identified global Codex rank. The median is the median of an explicitly subjective model, not a claim about the most likely true ranking.

## Sources

1. Local Codex activity: [ccusage Codex documentation](https://ccusage.com/guide/codex/), pinned CLI version 20.0.22. Input, cached input, cache creation, and output are added once. Reasoning is already part of output. Only dated aggregate counts are published, never raw conversations, filesystem paths, or authentication.
2. Observed comparison: [Tokscale leaderboard](https://tokscale.ai/leaderboard), [open-source implementation](https://github.com/junhoyeo/tokscale), and its public endpoint `https://tokscale.ai/api/leaderboard?period=all&sortBy=tokens&page=1&limit=100`. The initial capture fetched all 22 pages, checked 2,185 unique users, consecutive ranks, and descending token totals. Public `reference.json` retains numeric totals and source timestamps without names. It is a dated snapshot, not a claim that Tokscale is continuously synchronized.
3. Additional discovery: [Viberank](https://www.viberank.app/) and [its source](https://github.com/sculptdotfun/viberank). This separate volunteer board was investigated, but its users are not pooled into the estimator. No Viberank submission has been made by this project.
4. Population assumption: [reported Codex 25 million active-user milestone](https://x.com/thsottiaux/status/2094252447271366730). The model accepts 25 million as a scenario input. The monthly time window is unverified; we do not present it as measured MAU.

## Extrapolation

Let `p` be the proportion of sample users with tokens strictly greater than Marcus's recorded total, `N` the assumed population, and `B` the ratio of the probability of joining the sample for an above-threshold person versus a below-threshold person. If the unknown population proportion above Marcus is `q`, this sampling model implies:

```
p = Bq / (Bq + 1 - q)
q = p / (B(1 - p) + p)
rank = 1 + floor((N - 1)q)
```

The default `B` ranges from 100 to 10,000. A subjective uniform distribution over `log10(B)` has median 1,000. The monotone transform yields the displayed scenario median and endpoint envelope. The initial count is 706 of 2,185 above Marcus's 19,291,550,195 tokens: unrounded median 11,929, optimistic 1,194, conservative 118,771. Public displays round ranks to avoid decorative precision.

The **100–10,000 multipliers have no empirical calibration**. Changing them can move the answer by orders of magnitude. These endpoints are not confidence or credible limits derived from observed population data. There is no defensible probability that the true rank lies in this interval, and the median is not demonstrated to be the most likely true rank. The requested label “the least possible bullshit bullshit rank” is a joke, not a statistical guarantee.

## Comparison limitations

- The volunteer sample is self-selected, and the model corrects it only through an assumed single ratio.
- Tokscale aggregates multiple tools; Marcus's measurement is local Codex-only. An all-tool user above Marcus need not have higher Codex usage.
- The sample has different recording histories and may contain unverified submissions. Missing or duplicated device histories can alter totals.
- Lifetime recorded usage does not align with an unspecified active-user population window. The formula does not fix that mismatch.
- Cached input dominates Marcus's total. The chart separates cached activity from fresh input plus output; total tokens are not generated words or proof of work quality.
- API-equivalent cost is a parser estimate, not a subscription charge or bill. Pricing and local formats can change.
- Strictly greater totals determine positions; ties share the same threshold rank. At sample extremes the model becomes degenerate and should not be treated as evidence of world rank one or last.

The only exact public-board comparison is a hypothetical insertion into the captured mixed-tool sample. We do not label that an official position. A real global rank requires population-wide comparable usage data or a representative, validated sampling design, neither of which is available here.

## Refresh

`npm run refresh` reads local usage through ccusage and recomputes the model against the dated reference. It updates `public/data.json`; deploying publishes only `public/`. Loading the page rechecks the data every minute, but a timestamp always identifies the actual last measurement. An hourly publishing job must run separately on the owner's machine; visiting or forking does not enroll anyone in an automation or community leaderboard.
